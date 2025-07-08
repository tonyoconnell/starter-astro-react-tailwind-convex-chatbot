import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  return new Response(
    JSON.stringify({
      message: "Test API route is working!",
      url: request.url,
      timestamp: new Date().toISOString()
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};