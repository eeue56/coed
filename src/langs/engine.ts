import type { Diff, Result } from "./types.ts";

export type Row<tree> = {
    kind: "Row";
    id: number;
    tree: tree;
    commitId: string;
    metadata: object;
};

export type OpenMode =
    | { kind: "in-memory" }
    | { kind: "on-disk"; path: string };
export type Status = { kind: "open" } | { kind: "closed" };
type Connection<tree> =
    | { kind: "sqlite" }
    | { kind: "indexeddb" }
    | { kind: "in-memory"; rows: Row<tree>[] };

type StorageState<tree> = {
    mode: OpenMode;
    status: Status;
    connection: Connection<tree>;
    differ: ((left: tree, right: tree) => Diff<tree>) | null;
};

/**
 * creates the underlying table, or reopens it if it's available
 */
function open<tree>(mode: OpenMode, storage: Storage<tree>): Storage<tree> {
    switch (mode.kind) {
        case "in-memory": {
            storage._status = {
                mode,
                status: { kind: "open" },
                connection: { kind: "in-memory", rows: [] },
                differ: null,
            };

            return storage;
        }

        case "on-disk": {
            storage._status = {
                mode,
                status: { kind: "open" },
                connection: { kind: "sqlite" },
                differ: null,
            };

            return storage;
        }
    }
}

function close<tree>(storage: Storage<tree>): Storage<tree> {
    storage._status.status = { kind: "closed" };
    return storage;
}

function save<tree>(
    tree: tree,
    commitId: string,
    metadata: object,
    storage: Storage<tree>,
): { id: number } {
    switch (storage._status.connection.kind) {
        case "in-memory": {
            storage._status.connection.rows.push({
                kind: "Row",
                id: storage._status.connection.rows.length,
                tree,
                commitId,
                metadata,
            });
            return { id: storage._status.connection.rows.length - 1 };
        }

        case "sqlite":
        case "indexeddb":
            throw new Error("Not implemented");
    }
}

function lookup<tree>(id: number, storage: Storage<tree>): Result<Row<tree>> {
    switch (storage._status.connection.kind) {
        case "in-memory": {
            const row = storage._status.connection.rows.find(
                (row) => row.id === id,
            );
            if (row) {
                return { kind: "Ok", value: row };
            } else {
                return { kind: "Err", error: "Not found" };
            }
        }

        case "sqlite":
        case "indexeddb":
            throw new Error("Not implemented");
    }
}

function lookupCommit<tree>(
    commitId: string,
    storage: Storage<tree>,
): Result<Row<tree>> {
    switch (storage._status.connection.kind) {
        case "in-memory": {
            const row = storage._status.connection.rows.find(
                (row) => row.commitId === commitId,
            );
            if (row) {
                return { kind: "Ok", value: row };
            } else {
                return { kind: "Err", error: "Not found" };
            }
        }

        case "sqlite":
        case "indexeddb":
            throw new Error("Not implemented");
    }
}

/**
 * search through storage to find any with a matching subset object of a row's
 * metadata
 *
 * ```
 * const engine = new Storage();
 * engine.save(tree, commitId, { label: "ui" });
 * engine.search({label: "ui"}) // returns tree
 * ```
 *
 */
function search<tree>(
    query: Record<string, unknown>,
    storage: Storage<tree>,
): Row<tree>[] {
    switch (storage._status.connection.kind) {
        case "in-memory": {
            const rows = storage._status.connection.rows.filter((row) =>
                Object.entries(query).every(([key, value]) => {
                    if (key in row.metadata) {
                        const metadataValue = (
                            row.metadata as Record<string, unknown>
                        )[key];
                        return (
                            JSON.stringify(metadataValue) ===
                            JSON.stringify(value)
                        );
                    }
                    return false;
                }),
            );
            return rows;
        }

        case "sqlite":
        case "indexeddb":
            throw new Error("Not implemented");
    }
}

function rows<tree>(storage: Storage<tree>): Row<tree>[] {
    switch (storage._status.connection.kind) {
        case "in-memory": {
            return storage._status.connection.rows;
        }

        case "sqlite":
        case "indexeddb":
            throw new Error("Not implemented");
    }
}

function rowCount<tree>(storage: Storage<tree>): number {
    switch (storage._status.connection.kind) {
        case "in-memory": {
            return storage._status.connection.rows.length;
        }

        case "sqlite":
        case "indexeddb":
            throw new Error("Not implemented");
    }
}

function serialize<tree>(storage: Storage<tree>): string {
    switch (storage._status.connection.kind) {
        case "in-memory":
            return JSON.stringify(storage._status.connection.rows);
        case "sqlite":
        case "indexeddb":
            throw new Error("Not implemented");
    }
}

/**
 * todo: parse don't verify storage structure
 */
function deserialize<tree>(
    string: string,
    storage: Storage<tree>,
): Result<{ numberOfRowsLoaded: number }> {
    switch (storage._status.connection.kind) {
        case "in-memory": {
            try {
                /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
                storage._status.connection.rows = JSON.parse(string);
            } catch (e) {
                return {
                    kind: "Err",
                    /* eslint-disable-next-line @typescript-eslint/restrict-template-expressions */
                    error: `Failed to deserialize storage: ${e}`,
                };
            }

            return {
                kind: "Ok",
                value: {
                    numberOfRowsLoaded: storage._status.connection.rows.length,
                },
            };
        }
        case "sqlite":
        case "indexeddb":
            throw new Error("Not implemented");
    }
}

function registerDiffer<tree>(
    callback: (left: tree, right: tree) => Diff<tree>,
    storage: Storage<tree>,
): void {
    switch (storage._status.connection.kind) {
        case "in-memory": {
            storage._status.differ = callback;
            break;
        }

        case "sqlite":
        case "indexeddb":
            throw new Error("Not implemented");
    }
}

function diff<tree>(
    leftId: number,
    rightId: number,
    storage: Storage<tree>,
): Diff<tree> {
    switch (storage._status.connection.kind) {
        case "in-memory": {
            if (storage._status.differ === null) {
                return { diffs: [] };
            }
            const left = storage._status.connection.rows.find(
                (row) => row.id === leftId,
            );
            const right = storage._status.connection.rows.find(
                (row) => row.id === rightId,
            );

            if (typeof left === "undefined" && typeof right === "undefined") {
                return { diffs: [] };
            }

            if (typeof left !== "undefined" && typeof right === "undefined") {
                // todo: bring back left/right default when one is missing
                return {
                    diffs: [],
                };
            }
            if (typeof right !== "undefined" && typeof left === "undefined") {
                return {
                    diffs: [],
                };
            }

            /* eslint-disable-next-line  */
            return storage._status.differ(left!.tree, right!.tree);
        }

        case "sqlite":
        case "indexeddb":
            throw new Error("Not implemented");
    }
}

/**
 * each tree is stored in a db so that it can be compared
 *
 * addtionally, associated content (e.g commit/context/prompt) can be stored
 *
 * Uses sqlite on node, and indexeddb in the browser
 *
 * (todo: implement sqlite/indexeddb integration)
 */
export type Storage<tree> = {
    open: (mode: OpenMode) => void;
    close: () => void;
    save: (tree: tree, commitId: string, metadata: object) => { id: number };
    lookup: (id: number) => Result<Row<tree>>;
    lookupCommit: (commitId: string) => Result<Row<tree>>;
    search: (query: Record<string, unknown>) => Row<tree>[];
    rows: () => Row<tree>[];
    rowCount: () => number;
    serialize: () => string;
    deserialize: (string: string) => Result<{ numberOfRowsLoaded: number }>;
    diff: (leftId: number, rightId: number) => Diff<tree>;
    registerDiffer: (callback: (left: tree, right: tree) => Diff<tree>) => void;
    _status: StorageState<tree>;
};

/**
 * Create a storage for a specific type of tree
 */
export function Storage<tree>(): Storage<tree> {
    const storage: Storage<tree> = {
        open: (mode: OpenMode) => open(mode, storage),
        close: () => close(storage),
        save: (tree: tree, commitId: string, metadata: object) =>
            save(tree, commitId, metadata, storage),
        lookup: (id: number) => lookup(id, storage),
        lookupCommit: (commitId: string) => lookupCommit(commitId, storage),
        search: (query: Record<string, unknown>) => search(query, storage),
        rows: () => rows(storage),
        rowCount: () => rowCount(storage),
        serialize: () => serialize(storage),
        deserialize: (string: string) => deserialize(string, storage),
        registerDiffer: (callback: (left: tree, right: tree) => Diff<tree>) => {
            registerDiffer(callback, storage);
        },
        diff: (leftId: number, rightId: number) =>
            diff(leftId, rightId, storage),
        _status: {
            mode: { kind: "in-memory" },
            status: { kind: "closed" },
            connection: { kind: "in-memory", rows: [] },
            differ: null,
        },
    };

    return storage;
}
