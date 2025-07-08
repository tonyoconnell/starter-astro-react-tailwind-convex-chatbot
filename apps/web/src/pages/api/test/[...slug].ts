import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ request, params }) => {
  return new Response(
    JSON.stringify({
      message: "Catch-all test route is working!",
      url: request.url,
      params: params,
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