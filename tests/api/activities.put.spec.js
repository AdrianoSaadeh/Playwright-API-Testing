import { test, expect } from "@playwright/test";

test.describe('Validations for the PUT /api/v1/Activities/{id} endpoint', () => {

    let createdActivityId; // Variable to store the ID of the activity created for the test

    // `beforeAll` hook to create an activity before all PUT tests
    // This ensures we have a resource to update.
    test.beforeAll(async ({ request }) => {
        const newActivity = {
            title: "Original Activity for PUT",
            dueDate: 1748891012, // Assuming this is a Unix timestamp (seconds since epoch)
            completed: false
        };

        const response = await request.post(`activities`, {
            data: newActivity
        });
        const postResponse = await response.json();
        createdActivityId = postResponse.id; // Saves the ID of the created activity
        expect(response.status()).toBe(201); // Ensures the initial creation was successful
        expect(Number(createdActivityId)).toBeGreaterThan(40); // Validating a minimum ID value
    });

    test('Should update an existing activity and return 200 OK status with updated data', async ({ request }) => {
        // Data for the update
        const updatedTitle = "Activity Title Updated via Playwright";
        const updatedDueDate = 1748891012; // Updated Unix timestamp
        const updatedCompleted = false;

        const updatedActivityData = {
            id: createdActivityId, // VERY IMPORTANT: use the ID of the existing resource
            title: updatedTitle,
            dueDate: updatedDueDate,
            completed: updatedCompleted
        };

        const response = await request.put(`activities/${createdActivityId}`, {
            data: updatedActivityData
        });

        // --- PUT Response Validations ---

        // 1. Status Code Validation:
        expect(response.status()).toBe(200);

        // 2. Response Body Validation:
        const responseBody = await response.json();
        expect(responseBody).not.toBeNull();
        expect(Object.keys(responseBody).length).toBeGreaterThan(0);

        // 2.1. Validate Structure and Data Types
        expect(responseBody).toHaveProperty('id');
        expect(responseBody).toHaveProperty('title');
        expect(responseBody).toHaveProperty('dueDate');
        expect(responseBody).toHaveProperty('completed');
        expect(typeof responseBody.id).toBe('string'); // Assuming ID is a string based on the current API behavior
        expect(typeof responseBody.title).toBe('string');
        expect(typeof responseBody.dueDate).toBe('number'); // Assuming dueDate is a number (timestamp)
        expect(typeof responseBody.completed).toBe('boolean');

        // 2.2. Validate that Data Was Correctly Updated in the Response
        expect(responseBody.id).toBe(createdActivityId); // The ID should be the same
        expect(responseBody.title).toBe(updatedTitle);
        expect(responseBody.completed).toBe(updatedCompleted);

        // Date comparison - convert to ISO string to avoid timezone/format issues
        // Multiply by 1000 because JavaScript Date expects milliseconds for Unix timestamps
        const sentUpdatedDueDate = new Date(updatedDueDate * 1000).toISOString();
        const receivedUpdatedDueDate = new Date(responseBody.dueDate * 1000).toISOString();
        expect(receivedUpdatedDueDate).toBe(sentUpdatedDueDate);

        // --- Side Effect Validation (Subsequent GET) ---
        // 3. Persistence Validation: Perform a GET request to the updated ID to confirm the change in the "database"
        const getResponse = await request.get(`activities/${createdActivityId}`);
        expect(getResponse.status()).toBe(200);
        const fetchedActivity = await getResponse.json();

        // 3.1. Validate that the fetched resource reflects the updates
        expect(fetchedActivity.id).toBe(createdActivityId);
        expect(fetchedActivity.title).toBe(updatedTitle);
        expect(fetchedActivity.completed).toBe(updatedCompleted);
        const fetchedDueDate = new Date(fetchedActivity.dueDate * 1000).toISOString();
        expect(fetchedDueDate).toBe(sentUpdatedDueDate);
    });

    test('Should return 404 Not Found when trying to update a non-existent activity', async ({ request }) => {
        const nonExistentId = 999999; // An ID that surely does not exist
        const dataForNonExistent = {
            id: nonExistentId,
            title: "Title for Non-Existent Id",
            dueDate: 1748891012,
            completed: false
        };

        const response = await request.put(`activities/${nonExistentId}`, {
            data: dataForNonExistent
        });

        // 1. Status Code Validation:
        // For PUT on a non-existent resource, 404 Not Found is expected (if the API doesn't create a new one)
        expect(response.status()).toBe(404);
        const responseBody = await response.json();
        // The API actually returns a "Not found" string, not an object with a message property.
        expect(responseBody).toContain("Not found"); // More robust check if it's a string message
    });


});