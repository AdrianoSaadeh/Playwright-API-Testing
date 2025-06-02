import { test, expect } from "@playwright/test";


test.describe('Validations for the /api/v1/Activities endpoint', () => {

  test('Should return status 200 OK and an array of activities', async ({ request }) => {
    const response = await request.get("api/v1/Activities");

    // Validation 1: Status Code
    expect(response.ok()).toBeTruthy();

    // Validation 2: Response Type (should be an array)
    const activities = await response.json();
    expect(Array.isArray(activities)).toBeTruthy();
  });

  test('Should return a non-empty array with an expected number of activities (example with minimum)', async ({ request }) => {
    const response = await request.get("api/v1/Activities")
    const activities = await response.json();

    // Validation 3: Non-empty array
    expect(activities.length).toBeGreaterThan(0);

    // Validation 4: Expecting at least 30 activities
    expect(activities.length).toBeGreaterThanOrEqual(30); // Example: 
  });

  test('Should validate the structure and data types of each activity object', async ({ request }) => {
    const response = await request.get("api/v1/Activities")
    const activities = await response.json();

    // Iterates over each activity in the array to validate its structure and data types
    activities.forEach((activity) => {
      // Validation 5: Object Structure (presence of properties)
      expect(activity).toHaveProperty('id');
      expect(activity).toHaveProperty('title');
      expect(activity).toHaveProperty('dueDate');
      expect(activity).toHaveProperty('completed');

      // Validation 6: Data Types of Properties
      expect(typeof activity.id).toBe('number');
      expect(typeof activity.title).toBe('string');
      expect(typeof activity.dueDate).toBe('string');
      expect(new Date(activity.dueDate).toString()).not.toBe('Invalid Date');  // Optional: validate date format
      expect(typeof activity.completed).toBe('boolean');
    });
  });

  /////////////////////////////////////////////////////////////////////////////////
  test("GET activities by id", async ({ request }) => {
    const response = await request.get("api/v1/Activities/4")

    expect(response.ok()).toBeTruthy()
    const body = await response.json()
    expect(body.id).toBe(4)
    expect(body.title).toBe("Activity 4")
    //console.log(JSON.stringify(body))
  })
})

