import { test, expect } from "@playwright/test";

test.describe('testes', () => {
    test("GET activities by id", async ({ request }) => {
        const response = await request.get("api/v1/Activities/4")

        expect(response.ok()).toBeTruthy()
        const body = await response.json()
        expect(body.id).toBe(4)
        expect(body.title).toBe("Activity 4")
        console.log(JSON.stringify(body))
    })
})


