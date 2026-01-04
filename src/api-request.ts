import type { ApiRouter } from '../server/api/router.ts';

export function apiRequest<
  ENDPOINT extends keyof ApiRouter,
  INPUT = ApiRouter[ENDPOINT]['input'],
  OUTPUT = ApiRouter[ENDPOINT]['output'],
>(endpoint: ENDPOINT, input: INPUT): Promise<OUTPUT> {
  return fetch(endpoint as string, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    return response.json() as Promise<OUTPUT>;
  });
}
