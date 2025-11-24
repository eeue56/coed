import { test, expect } from "@playwright/test";

test("text-fields example loads and works", async ({ page }) => {
    await page.goto("/examples/text-fields/");

    // Wait for the root element to be populated
    await page.waitForSelector("#root", { state: "attached", timeout: 10000 });

    // Check that the page loaded
    const content = await page.locator("#root").textContent();
    expect(content).toBeTruthy();

    // The text-fields example should display some content
    const rootElement = await page.locator("#root");
    const childCount = await rootElement.locator("*").count();
    expect(childCount).toBeGreaterThan(0);

    // Try to find and interact with text inputs if they exist
    const inputCount = await page.locator('input[type="text"]').count();
    if (inputCount > 0) {
        await page.fill('input[type="text"]', "Test input");
        const afterInput = await page.locator("#root").textContent();
        expect(afterInput).toContain("Test input");
    }
});
