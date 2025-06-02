/// <reference lib="deno.ns" />
import "@std/dotenv/load";
import { serveDir } from "@std/http/file-server";

// const secret = Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, "0")).join("");
// console.log("Generated secret:", secret);

Deno.serve({
  port: parseInt(Deno.env.get("PORT") || "8000", 10),
}, (req) => {
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
