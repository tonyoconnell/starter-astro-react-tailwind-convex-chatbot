import { describe, it, expect, vi } from "vitest";

// Mock environment variables
vi.mock("process", () => ({
  env: {
    CONVEX_URL: "https://test.convex.cloud",
    BETTER_AUTH_URL: "http://localhost:4321",
    BETTER_AUTH_SECRET: "test-secret",
    GOOGLE_CLIENT_ID: "test-google-id",
    GOOGLE_CLIENT_SECRET: "test-google-secret",
    GITHUB_CLIENT_ID: "test-github-id",
    GITHUB_CLIENT_SECRET: "test-github-secret",
    NODE_ENV: "test",
  },
}));

// Mock Convex client
vi.mock("convex/browser", () => ({
  ConvexHttpClient: vi.fn().mockImplementation(() => ({
    query: vi.fn(),
    mutation: vi.fn(),
  })),
}));

// Mock BetterAuth modules
vi.mock("better-auth", () => ({
  betterAuth: vi.fn().mockImplementation((config) => ({
    createAuthClient: vi.fn().mockReturnValue({
      signIn: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
    }),
    config,
  })),
}));

vi.mock("@better-auth-kit/convex", () => ({
  convexAdapter: vi.fn().mockImplementation((client) => ({
    type: "convex",
    client,
  })),
}));

describe("Auth Configuration", () => {
  it("should create auth configuration with correct providers", async () => {
    const { auth } = await import("./config");
    
    expect(auth).toBeDefined();
    expect(auth.config).toBeDefined();
  });

  it("should have Google and GitHub OAuth providers configured", async () => {
    const { auth } = await import("./config");
    
    expect(auth.config.socialProviders).toEqual(
      expect.objectContaining({
        google: expect.objectContaining({
          clientId: "test-google-id",
          clientSecret: "test-google-secret",
        }),
        github: expect.objectContaining({
          clientId: "test-github-id",
          clientSecret: "test-github-secret",
        }),
      })
    );
  });

  it("should have security features enabled", async () => {
    const { auth } = await import("./config");
    
    expect(auth.config.security).toEqual(
      expect.objectContaining({
        csrf: expect.objectContaining({ enabled: true }),
        rateLimit: expect.objectContaining({ enabled: true }),
      })
    );
  });

  it("should create auth client", async () => {
    const { authClient } = await import("./config");
    
    expect(authClient).toBeDefined();
    expect(authClient.signIn).toBeDefined();
    expect(authClient.signOut).toBeDefined();
    expect(authClient.getSession).toBeDefined();
  });
});