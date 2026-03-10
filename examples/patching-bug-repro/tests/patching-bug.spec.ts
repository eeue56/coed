import { test, expect } from "@playwright/test";

test.describe("Patching Bug Reproduction - Issue #3", () => {
    test.beforeEach(async ({ page }) => {
        // Start the dev server manually on port 8000
        await page.goto("http://localhost:8000");
    });

    test("demonstrates the patching bug with deeply nested similar nodes", async ({
        page,
    }) => {
        // Wait for the page to load
        await page.waitForSelector(".queries-container");

        // Take initial screenshot
        await page.screenshot({
            path: "tests/screenshots/01-initial.png",
        });

        // Count initial queries (now 3 instead of 2)
        const initialQueries = await page.locator(".filter-query").count();
        console.log(`Initial queries: ${initialQueries}`);
        expect(initialQueries).toBe(3);

        // Add one more query to make bug more visible
        await page.click(".add-button");
        await page.waitForTimeout(100);
        await page.screenshot({
            path: "tests/screenshots/02-after-add-1.png",
        });

        // Verify we now have 4 queries
        const queriesAfterAdding = await page.locator(".filter-query").count();
        console.log(`Queries after adding: ${queriesAfterAdding}`);
        expect(queriesAfterAdding).toBe(4);

        // Get input values of all queries before removal
        const query2FieldBefore = await page.locator(".filter-query").nth(1).locator(".field-input").inputValue();
        const query3FieldBefore = await page.locator(".filter-query").nth(2).locator(".field-input").inputValue();
        console.log(`Query 2 field before removal: ${query2FieldBefore}`);
        console.log(`Query 3 field before removal: ${query3FieldBefore}`);

        // Click the second remove button (Remove Query 2)
        const removeButtons = page.locator(".remove-button");
        await removeButtons.nth(1).click();
        await page.waitForTimeout(200);
        await page.screenshot({
            path: "tests/screenshots/03-after-remove.png",
        });

        // Check how many queries remain
        const queriesAfterRemoval = await page
            .locator(".filter-query")
            .count();
        console.log(`Queries after removal: ${queriesAfterRemoval}`);
        expect(queriesAfterRemoval).toBe(3);

        // Get field values after removal to check if bug occurred
        const query2FieldAfter = await page.locator(".filter-query").nth(1).locator(".field-input").inputValue();
        console.log(`Query 2 field after removal: ${query2FieldAfter}`);
        
        // BUG DEMONSTRATION: Query 2 should have been removed (priority),
        // but due to the bug, Query 2 now shows content from what was Query 3 (category)
        console.log(`Expected Query 2 to be removed (was: ${query2FieldBefore})`);
        console.log(`Query 2 now shows: ${query2FieldAfter} (content from old Query 3: ${query3FieldBefore})`);

        // Take a final screenshot
        await page.screenshot({
            path: "tests/screenshots/04-final.png",
            fullPage: true,
        });

        // Log all query input values for debugging
        const queryDivs = await page.locator(".filter-query").all();
        for (let i = 0; i < queryDivs.length; i++) {
            const fieldValue = await queryDivs[i].locator(".field-input").inputValue();
            const valueValue = await queryDivs[i].locator(".value-input").inputValue();
            console.log(`Query ${i + 1}: field="${fieldValue}", value="${valueValue}"`);
        }
    });

    test("verifies the bug with input field mixing", async ({
        page,
    }) => {
        await page.waitForSelector(".queries-container");

        // Start with 3 queries, add one more
        await page.click(".add-button");
        await page.waitForTimeout(50);

        // Initial count should be 4
        const initialCount = await page.locator(".filter-query").count();
        expect(initialCount).toBe(4);

        // Store the field values before removal
        const query2Field = await page.locator(".filter-query").nth(1).locator(".field-input").inputValue();
        const query3Field = await page.locator(".filter-query").nth(2).locator(".field-input").inputValue();
        console.log(`Query 2 field before: ${query2Field}`);
        console.log(`Query 3 field before: ${query3Field}`);

        // Remove query 2 (index 1)
        await page.locator(".remove-button").nth(1).click();
        await page.waitForTimeout(100);

        // Verify count
        const afterCount = await page.locator(".filter-query").count();
        expect(afterCount).toBe(3);

        // Check if the bug occurred - Query 2's field value changed to Query 3's
        const query2FieldAfter = await page.locator(".filter-query").nth(1).locator(".field-input").inputValue();
        console.log(`Query 2 field after: ${query2FieldAfter}`);
        console.log(`BUG: Query 2 changed from "${query2Field}" to "${query2FieldAfter}" (should have been removed)`);

        // Take screenshot for manual inspection
        await page.screenshot({
            path: "tests/screenshots/05-programmatic-check.png",
            fullPage: true,
        });
    });
});
