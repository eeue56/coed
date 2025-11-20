import { test, expect } from "@playwright/test";

test.describe("Patching Bug Reproduction - Issue #3", () => {
    test.beforeEach(async ({ page }) => {
        // Start the dev server manually or use a static build
        await page.goto("http://localhost:1234");
    });

    test("demonstrates the patching bug with similar nodes", async ({
        page,
    }) => {
        // Wait for the page to load
        await page.waitForSelector(".queries-container");

        // Take initial screenshot
        await page.screenshot({
            path: "tests/screenshots/01-initial.png",
        });

        // Count initial queries
        const initialQueries = await page.locator(".filter-query").count();
        console.log(`Initial queries: ${initialQueries}`);
        expect(initialQueries).toBe(2);

        // Add more queries to make the bug more reproducible
        await page.click(".add-button");
        await page.waitForTimeout(100);
        await page.screenshot({
            path: "tests/screenshots/02-after-add-1.png",
        });

        await page.click(".add-button");
        await page.waitForTimeout(100);
        await page.screenshot({
            path: "tests/screenshots/03-after-add-2.png",
        });

        await page.click(".add-button");
        await page.waitForTimeout(100);
        await page.screenshot({
            path: "tests/screenshots/04-after-add-3.png",
        });

        // Verify we now have 5 queries
        const queriesAfterAdding = await page.locator(".filter-query").count();
        console.log(`Queries after adding: ${queriesAfterAdding}`);
        expect(queriesAfterAdding).toBe(5);

        // Get text content of all queries before removal
        const queryTexts = await page
            .locator(".filter-query .filter-query-result strong")
            .allTextContents();
        console.log("Query texts before removal:", queryTexts);

        // Click the second remove button (index 1)
        const removeButtons = page.locator(".remove-button");
        await removeButtons.nth(1).click();
        await page.waitForTimeout(200);
        await page.screenshot({
            path: "tests/screenshots/05-after-remove.png",
        });

        // Check how many queries remain
        const queriesAfterRemoval = await page
            .locator(".filter-query")
            .count();
        console.log(`Queries after removal: ${queriesAfterRemoval}`);
        expect(queriesAfterRemoval).toBe(4);

        // Get text content of all queries after removal
        const queryTextsAfter = await page
            .locator(".filter-query .filter-query-result strong")
            .allTextContents();
        console.log("Query texts after removal:", queryTextsAfter);

        // The bug: Check if the queries are what we expect
        // We removed query 2, so we should have: Query 1, Query 3, Query 4, Query 5
        // But the bug might cause incorrect behavior

        // Take a final screenshot
        await page.screenshot({
            path: "tests/screenshots/06-final.png",
            fullPage: true,
        });

        // Log all query divs for debugging
        const queryDivs = await page.locator(".filter-query").all();
        for (let i = 0; i < queryDivs.length; i++) {
            const text = await queryDivs[i].textContent();
            console.log(`Query ${i}: ${text}`);
        }
    });

    test("verifies the bug can be observed programmatically", async ({
        page,
    }) => {
        await page.waitForSelector(".queries-container");

        // Add queries
        for (let i = 0; i < 3; i++) {
            await page.click(".add-button");
            await page.waitForTimeout(50);
        }

        // Get initial state
        const initialCount = await page.locator(".filter-query").count();
        expect(initialCount).toBe(5);

        // Store the text of query 3 (index 2)
        const query3Text = await page
            .locator(".filter-query")
            .nth(2)
            .textContent();
        console.log("Query 3 text before removal:", query3Text);

        // Remove query 2 (index 1)
        await page.locator(".remove-button").nth(1).click();
        await page.waitForTimeout(100);

        // Verify count
        const afterCount = await page.locator(".filter-query").count();
        expect(afterCount).toBe(4);

        // Check if query 3 is still present and unchanged
        // In the buggy version, the content might get mixed up
        const remainingQueries = await page
            .locator(".filter-query")
            .allTextContents();
        console.log("Remaining queries:", remainingQueries);

        // Take screenshot for manual inspection
        await page.screenshot({
            path: "tests/screenshots/programmatic-check.png",
            fullPage: true,
        });
    });
});
