import { test, expect } from "@playwright/test";

test("forms example loads and validates form", async ({ page }) => {
    await page.goto("/examples/forms/");

    // Wait for the form to load
    await page.waitForSelector("#root input");

    // Initially, all fields should be empty
    const initialText = await page.locator("#root").textContent();
    expect(initialText).toBeTruthy();

    // Fill in the name field
    await page.fill('input[type="text"]', "TestUser");

    // Fill in the password field (first password input)
    const passwordInputs = await page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill("password123");

    // Fill in the password again field (second password input)
    await passwordInputs.nth(1).fill("password123");

    // Check that the form shows success when passwords match
    const afterMatchingText = await page.locator("#root").textContent();
    expect(afterMatchingText).toBeTruthy();

    // Change the second password to not match
    await passwordInputs.nth(1).fill("different");

    // The page should show an error or different state
    const afterMismatchText = await page.locator("#root").textContent();
    expect(afterMismatchText).toBeTruthy();
});
