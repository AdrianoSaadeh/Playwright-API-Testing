import { test, expect } from "@playwright/test";

test.describe("Endpoint Validations for GET /api/v1/Activities/{id}", () => {

    // --- Scenario 1: Object Found (Valid ID) ---
    test("Should return a specific activity with 200 OK status for a valid ID", async ({ request }) => {
        const activityId = "8"; // ID of an activity that we know exists
        const response = await request.get(`activities/${activityId}`);
        const activityResponse = await response.json();

        // Validation 1: Status Code for success
        expect(response.status()).toBe(200);

        // Validation 2: Response Type (should be an object, not an array)
        expect(typeof activityResponse).toBe("object");
        expect(Array.isArray(activityResponse)).toBeFalsy(); // Ensures it's not an array

        // Validation 3: Data Integrity (returned ID should match the requested ID)
        expect(activityResponse.id).toBe(activityId);

        // Validation 4: Specific Values (if you expect a particular value for a known ID)
        // Example: if we know that activity with ID 1 has a specific title
        expect(activityResponse.title).toBe("title 8");
    });

    // --- Scenario 2: Object Not Found (Invalid/Non-existent ID) ---
    test("Should return 404 Not Found status for a non-existent ID", async ({ request }) => {
        const nonExistentActivityId = "999"; // ID of an activity that likely doesn't exist
        const response = await request.get(`activities/${nonExistentActivityId}`);
        const activityResponse = await response.json();

        // Validation 1: Status Code for "not found"
        expect(response.status()).toBe(404);

        // Validation 2: Response Body (can be empty or contain an error message)
        expect(activityResponse).toBe("Not found");
        
    });

    // --- Scenario 3: Invalid ID Format (e.g., string instead of number) ---
    test("Should return an error for an invalid ID format (if the API is robust enough for this)", async ({ request }) => {
        const invalidId = "abc"; // ID with an invalid format
        const response = await request.get(`activities/${invalidId}`);

        // The Faker API returns 400 for strings
        expect(response.status()).toBe(404);
    });
});