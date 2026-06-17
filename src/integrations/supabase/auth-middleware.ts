// Mock authentication middleware for standalone demo execution
import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "./client";

export const requireSupabaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    // Inject mock user id and client directly without token validation
    return next({
      context: {
        supabase,
        userId: "mock-user-id",
        claims: {
          sub: "mock-user-id",
          email: "demo@vedaglows.com",
          role: "authenticated",
        },
      },
    });
  },
);

export const optionalSupabaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    // Return mock context, letting anonymous workflows run smoothly
    return next({
      context: {
        supabase,
        userId: "mock-user-id",
      },
    });
  },
);
