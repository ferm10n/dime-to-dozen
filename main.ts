/// <reference lib="deno.ns" />
import { serveDir } from "@std/http/file-server";

Deno.serve((req) => {
  const pathname = new URL(req.url).pathname;
  if (pathname.startsWith("/api/hello")) {
    return new Response("Hello, World!", {
      headers: { "Content-Type": "text/plain" },
    });
  }
  return serveDir(req, {
    fsRoot: "dist",
  });
});
