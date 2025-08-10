/// <reference lib="deno.ns" />
import "@std/dotenv/load";
import { serveDir } from "@std/http/file-server";
import { router } from "./api/router.ts";
import { ApiEndpointDef, parseOrDie } from "./api/util.ts";

// checking if the dev db is set:
console.log({
  DATABASE_URL_HASH: await crypto.subtle.digest("SHA-256", new TextEncoder().encode(Deno.env.get("DATABASE_URL") || "")),
})

function jsonResponse (payload: unknown) {
  return new Response(JSON.stringify(payload), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
  });
}

Deno.serve({
  port: parseInt(Deno.env.get("PORT") || "6960", 10),
}, async (req) => {
  try {
    const pathname = new URL(req.url).pathname;

    const apiEndpoint: ApiEndpointDef<any, unknown> = router[pathname as keyof typeof router];
    if (apiEndpoint && req.method === "POST") {
      let body: any = null;
      if (apiEndpoint.inputSchema) {
        body = parseOrDie(apiEndpoint.inputSchema, await req.json());
      }
      const responseData: unknown = await apiEndpoint.handler(body);
      if (typeof responseData === 'string') {
        return new Response(responseData, {
          headers: { "Content-Type": "text/plain" },
        });
      } else {
        return jsonResponse(responseData);
      }
    }

    // Serve static assets from dist directory
    // First try to serve the exact path for static assets
    const fsRoot = "dist";
    try {
      // Check if the path is a file in our dist directory
      const normalized = pathname === "/" ? "/index.html" : pathname;
      const pathStat = await Deno.stat(`${fsRoot}${normalized}`);
      
      // If it's a file, serve it directly
      if (pathStat.isFile) {
        return serveDir(req, { fsRoot });
      }
    } catch {
      // File doesn't exist, continue to serve index.html
    }

    // For all other routes, serve index.html to support SPA client-side routing
    // This ensures that navigating directly to a route like /monthly-overview still works
    return new Response(await Deno.readFile(`${fsRoot}/index.html`), {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error("Error handling request:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
});
