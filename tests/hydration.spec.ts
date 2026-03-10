import { test, expect } from "@playwright/test";

test("hydration example loads", async ({ page }) => {
    await page.goto("/examples/hydration/");

    // Wait for content to load
    await page.waitForTimeout(2000);

    // Check that the page loaded - look for the button or any content
    const content = await page.textContent("body");
    expect(content).toBeTruthy();
    
    // Should have some content rendered
    expect(content!.length).toBeGreaterThan(0);
});
