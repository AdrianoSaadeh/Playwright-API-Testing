import { test, expect } from "@playwright/test";

test.describe("activities/{4}", async () => {
  test("GET activities by id", async ({ request }) => {
    const response = await request.get("api/v1/Activities/4")

    expect(response.status()).toBe(200)
    const body = await response.json()
    console.log(JSON.stringify(body))
  })
})