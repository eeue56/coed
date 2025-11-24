import { test, expect } from "@playwright/test";

test("text-fields example loads and works", async ({ page }) => {
    await page.goto("/examples/text-fields/");

    // Wait for the input element to be populated
    await page.waitForSelector("#root input", { state: "attached", timeout: 10000 });

    // Check that the page has an input field
    const inputCount = await page.locator('input').count();
    expect(inputCount).toBeGreaterThan(0);

    // Try to interact with the input
    await page.fill('input', "Hello");
    
    // The reversed text should appear
    const content = await page.locator("#root").textContent();
    expect(content).toContain("olleH");
});
