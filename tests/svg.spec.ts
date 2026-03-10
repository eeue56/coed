import { test, expect } from "@playwright/test";

test("svg example loads and displays SVG", async ({ page }) => {
    await page.goto("/examples/svg/");

    // Wait for the root element to be populated
    await page.waitForSelector("#root", { state: "attached", timeout: 10000 });

    // Check that the page loaded
    const content = await page.locator("#root").textContent();
    expect(content).toBeTruthy();

    // The SVG example should have an SVG element
    const svgCount = await page.locator("svg").count();
    expect(svgCount).toBeGreaterThan(0);
});
