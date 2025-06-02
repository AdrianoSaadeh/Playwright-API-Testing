import { test, expect } from "@playwright/test";

test.describe("Validations for the /api/v1/Activities endpoint", () => {
  let response; // Variables to store the API response
  let activitiesResponse; // Variables to store the JSON response

  test.beforeEach(async ({ request }) => {
    // Makes the request and parses the JSON only once per test
    response = await request.get("api/v1/Activities"); 
    activitiesResponse = await response.json();
  });

  test("Should return status 200 OK and an array of activities", async ({ request }) => {
    // Validation 1: Status Code
    expect(response.ok()).toBeTruthy();

    // Validation 2: Response Type (should be an array)
    expect(Array.isArray(activitiesResponse)).toBeTruthy();
  });

  test("Should return a non-empty array with an expected number of activities (example with minimum)", async ({ request }) => {
    // Validation 3: Non-empty array
    expect(activitiesResponse.length).toBeGreaterThan(0);

    // Validation 4: Expecting at least 30 activities
    expect(activitiesResponse.length).toBeGreaterThanOrEqual(30);
  });

  test("Should validate the structure and data types of each activity object", async ({ request }) => {
    // Iterates over each activity in the array to validate its structure and data types
    activitiesResponse.forEach((activity) => {
      // Validation 5: Object Structure (presence of properties)
      expect(activity).toHaveProperty("id");
      expect(activity).toHaveProperty("title");
      expect(activity).toHaveProperty("dueDate");
      expect(activity).toHaveProperty("completed");

      // Validation 6: Data Types of Properties
      expect(typeof activity.id).toBe("number");
      expect(typeof activity.title).toBe("string");
      expect(typeof activity.dueDate).toBe("string");
      expect(typeof activity.completed).toBe("boolean");
    });
  });

  test("Should validate that all IDs are unique and that the completed field is a boolean", async ({ request }) => {
    const ids = activitiesResponse.map((activity) => activity.id);

    // Validation 7: Uniqueness of IDs
    const uniqueIds = new Set(ids); // Creates a Set to get only unique IDs
    expect(uniqueIds.size).toBe(ids.length); // The number of unique IDs must be equal to the total number of IDs
  });

  test("Should validate that there is at least one activity marked as `completed: true` and one as `completed: false`", async ({ request }) => {
    // Validation 8: Presence of different states (if applicable)
    const hasCompletedTrue = activitiesResponse.some((activity) => activity.completed === true);
    const hasCompletedFalse = activitiesResponse.some((activity) => activity.completed === false);

    expect(hasCompletedTrue).toBeTruthy();
    expect(hasCompletedFalse).toBeTruthy();
  });

  test("Should validate that the `dueDate` is a valid date for all activities", async ({ request }) => {
    activitiesResponse.forEach((activity) => {
      // Validation 9: More robust date format validation (if the format is consistent)
      const date = new Date(activity.dueDate);
      expect(date.toString()).not.toBe("Invalid Date");
    });
  });
});