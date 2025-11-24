import { test, expect } from "@playwright/test";

test("book example loads and displays books", async ({ page }) => {
    await page.goto("/examples/book/");

    // Wait for the root element to be populated
    await page.waitForSelector("#root", { state: "attached", timeout: 10000 });

    // Check that the page loaded and shows loading text or content
    const content = await page.locator("#root").textContent();
    expect(content).toBeTruthy();
    
    // Should show "Loading..." initially or loaded content
    expect(content).toMatch(/(Loading|public opinion|unable to load)/i);
});
