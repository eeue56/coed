import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { javascript } from "../src/langs/javascript/index.ts";
import type { Purity } from "../src/langs/javascript/types.ts";

const supportedExtensions = new Set([
    ".cjs",
    ".cts",
    ".js",
    ".mjs",
    ".mts",
    ".ts",
]);
const ignoredDirectories = new Set([
    ".git",
    ".next",
    ".turbo",
    "build",
    "coverage",
    "dist",
    "node_modules",
]);

async function sourceFiles(folder: string): Promise<string[]> {
    const files: string[] = [];

    async function visit(directory: string): Promise<void> {
        const entries = await readdir(directory, { withFileTypes: true });
        entries.sort((left, right) => left.name.localeCompare(right.name));

        for (const entry of entries) {
            const fullPath = path.join(directory, entry.name);
            if (entry.isDirectory()) {
                if (!ignoredDirectories.has(entry.name)) {
                    await visit(fullPath);
                }
                continue;
            }

            if (
                entry.isFile() &&
                supportedExtensions.has(path.extname(entry.name)) &&
                !/\.d\.(?:ts|mts|cts)$/.test(entry.name)
            ) {
                files.push(fullPath);
            }
        }
    }

    await visit(folder);
    return files;
}

async function main(): Promise<void> {
    const requestedFolder = process.argv[2];
    if (!requestedFolder || process.argv.length !== 3) {
        throw new Error("Usage: node scripts/purity-overview.ts <folder>");
    }

    const folder = path.resolve(requestedFolder);
    const files = await sourceFiles(folder);
    const totals: Record<Purity, number> = {
        Pure: 0,
        ModifiesInputs: 0,
        HasSideEffects: 0,
    };
    let parseErrors = 0;

    for (const file of files) {
        const relativePath = path.relative(folder, file) || path.basename(file);
        const source = await readFile(file, "utf8");
        const parsed = javascript.parse(source);
        if (parsed.kind === "Err") {
            parseErrors++;
            const reason = parsed.error.match(/Problem: ([^\n]+)/)?.[1];
            const location = parsed.error.match(/At line ([^\n]+)/)?.[1];
            const details = [reason, location].filter(Boolean).join(" ");
            console.log(
                `${relativePath}\tPARSE_ERROR\t${details || "Unable to parse"}`,
            );
            continue;
        }

        const purity = javascript.checkPurity(parsed.value);
        totals[purity]++;
        console.log(`${relativePath}\t${purity}`);
    }

    console.log("");
    console.log(`Files scanned: ${files.length}`);
    console.log(`Pure: ${totals.Pure}`);
    console.log(`ModifiesInputs: ${totals.ModifiesInputs}`);
    console.log(`HasSideEffects: ${totals.HasSideEffects}`);
    console.log(`Parse errors: ${parseErrors}`);
}

if (
    process.argv[1] &&
    path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
    main().catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        console.error(message);
        process.exitCode = 1;
    });
}
