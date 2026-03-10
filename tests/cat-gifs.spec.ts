import { test, expect } from "@playwright/test";

test("cat-gifs example loads", async ({ page }) => {
    await page.goto("/examples/cat-gifs/");

    // Wait for the root element to be populated
    await page.waitForSelector("#root", { state: "attached", timeout: 10000 });

    // Check that the page loaded
    const content = await page.locator("#root").textContent();
    expect(content).toBeTruthy();

    // The cat-gifs example should display "Random cats" heading
    expect(content).toContain("Random cats");

    // The page should have an h2 element
    const h2Count = await page.locator("h2").count();
    expect(h2Count).toBeGreaterThan(0);
});
