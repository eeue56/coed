import { test, expect } from "@playwright/test";

test("counter example loads and works", async ({ page }) => {
    await page.goto("/examples/counter/");

    // Wait for the root element to have content
    await page.waitForSelector("#root button", { timeout: 10000 });

    // Check that the initial count is 0
    const initialText = await page.locator("#root").textContent();
    expect(initialText).toContain("0");

    // Click the + button
    await page.click(".button-add");

    // Check that count increased to 1
    const afterAddText = await page.locator("#root").textContent();
    expect(afterAddText).toContain("1");

    // Click the - button
    await page.click(".button-sub");

    // Check that count went back to 0
    const afterSubText = await page.locator("#root").textContent();
    expect(afterSubText).toContain("0");

    // Click - again to test negative numbers
    await page.click(".button-sub");
    const negativeText = await page.locator("#root").textContent();
    expect(negativeText).toContain("-1");
});
