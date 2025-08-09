import { z } from "zod/v4";

export type ApiEndpointDef<INPUT extends null | z.ZodType, OUTPUT> = {
  inputSchema: INPUT;
  handler: (reqBody: z.infer<INPUT>) => Promise<OUTPUT>;
};

export const passkeySchema = z.object({
  passkey: z.string(),
});

const correctPasskey = Deno.env.get("APP_PASSKEY");
if (!correctPasskey) {
  throw new Error("APP_PASSKEY environment variable is not set");
}

export function parseOrDie<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error("Validation error:", result.error);
    throw new Response("Invalid input", {
      status: 400,
      headers: { "content-type": "text/plain" },
    });
  }
  return result.data;
}

export function ensurePasskey(body: unknown) {
  const { passkey } = parseOrDie(passkeySchema, body);
  if (passkey !== correctPasskey) {
    throw new Response("Invalid passkey", {
      status: 403,
      headers: { "content-type": "text/plain" },
    });
  }
}

export function defineEndpoint<INPUT extends z.ZodType | null, OUTPUT>(
  opts: ApiEndpointDef<INPUT, OUTPUT>,
) {
  return opts;
}
