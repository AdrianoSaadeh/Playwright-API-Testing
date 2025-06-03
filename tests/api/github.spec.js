import { test, expect } from "@playwright/test";

const baseURL = 'https://api.github.com';

// Test for an authenticated endpoint (your own user)
test('should get authenticated user profile', async ({ request }) => {
    const response = await request.get(`${baseURL}/user`);
    expect(response.status()).toBe(200); // 200 OK for success
    const user = await response.json();
    console.log(user);

    // Validate the basic user structure
    expect(user).toHaveProperty('login');
    expect(typeof user.login).toBe('string');
    expect(user).toHaveProperty('id');
    expect(typeof user.id).toBe('number');
    expect(user).toHaveProperty('name'); // Your GitHub name
    expect(typeof user.name).toBe('string');
    expect(user).toHaveProperty('public_repos');
    expect(typeof user.public_repos).toBe('number');

    console.log(`Authenticated as: ${user.login}`);
    console.log(`Public Repositories: ${user.public_repos}`);
});

// Test for an authenticated endpoint (your user's repositories)
test('should get authenticated user repositories', async ({ request }) => {
    const response = await request.get(`${baseURL}/user/repos`);
    expect(response.status()).toBe(200);
    const repos = await response.json();

    expect(Array.isArray(repos)).toBeTruthy();
    expect(repos.length).toBeGreaterThanOrEqual(0); // You might have 0 repos

    if (repos.length > 0) {
        const firstRepo = repos[0];
        expect(firstRepo).toHaveProperty('id');
        expect(typeof firstRepo.id).toBe('number');
        expect(firstRepo).toHaveProperty('name');
        expect(typeof firstRepo.name).toBe('string');
        expect(firstRepo).toHaveProperty('full_name');
        expect(typeof firstRepo.full_name).toBe('string');
        expect(firstRepo).toHaveProperty('private');
        expect(typeof firstRepo.private).toBe('boolean');
        expect(firstRepo).toHaveProperty('owner');
        expect(firstRepo.owner).toHaveProperty('login');
    }
});

// Test for an endpoint that does not require authentication (public user)
test('should get a public user profile without authentication', async ({ request }) => {
    const publicUser = 'octocat'; // A known public user
    const response = await request.get(`${baseURL}/users/${publicUser}`);
    expect(response.status()).toBe(200);
    const user = await response.json();

    expect(user).toHaveProperty('login', publicUser);
    expect(user).toHaveProperty('id');
});

// Test for unauthorized access (simulating authentication failure)
// In this test, we'll *remove* the authentication header to simulate access without a token.
test('should return 401 Unauthorized when no token is provided for authenticated endpoint', async ({ request }) => {
    // Create a new request context without the Authorization header.
    const unauthorizedRequestContext = await test.request.newContext({
        baseURL: 'https://api.github.com',
        extraHTTPHeaders: {
            'Accept': 'application/vnd.github.v3+json',
            // Do not send the token or send an invalid one here
        },
    });

    const response = await unauthorizedRequestContext.get('/user');
    expect(response.status()).toBe(401); // 401 Unauthorized
    const errorBody = await response.json();
    expect(errorBody).toHaveProperty('message', 'Requires authentication');
    // Always dispose of the request context if you created it explicitly
    await unauthorizedRequestContext.dispose();
});