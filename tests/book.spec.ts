import { test, expect } from "@playwright/test";

test("book example loads and displays books", async ({ page }) => {
    await page.goto("/examples/book/");

    // Wait for the root element to be populated
    await page.waitForSelector("#root", { state: "attached", timeout: 10000 });

    // Check that the page loaded
    const content = await page.locator("#root").textContent();
    expect(content).toBeTruthy();

    // The book example should display some content
    // Check if there are any elements inside root
    const rootElement = await page.locator("#root");
    const childCount = await rootElement.locator("*").count();
    expect(childCount).toBeGreaterThan(0);
});
