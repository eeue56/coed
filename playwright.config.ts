import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./src/tests/playwright/",
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: 0,
    workers: 1,
    reporter: "line",
    use: {
        ...devices["Desktop Chrome"],
        browserName: "chromium",
        headless: true,
        viewport: { width: 1200, height: 900 },
        colorScheme: "light",
        trace: "off",
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
});
