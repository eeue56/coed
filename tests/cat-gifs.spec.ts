import { test, expect } from "@playwright/test";

test("cat-gifs example loads", async ({ page }) => {
    await page.goto("/examples/cat-gifs/");

    // Wait for the root element to be populated
    await page.waitForSelector("#root", { state: "attached", timeout: 10000 });

    // Check that the page loaded
    const content = await page.locator("#root").textContent();
    expect(content).toBeTruthy();

    // The cat-gifs example should display some content (may have loading state or button)
    const rootElement = await page.locator("#root");
    const childCount = await rootElement.locator("*").count();
    expect(childCount).toBeGreaterThan(0);

    // Try to find the "More Please" button if it exists
    const buttonCount = await page.locator("button").count();
    expect(buttonCount).toBeGreaterThan(0);
});
