export type APIMethod = "GET" | "POST" | "PATCH" | "DELETE" | "PUT";

export type CreateAPIMethods = <
  TInput extends Record<string, any>,
  TOutput,
>(opts: {
  url: string;
  method: APIMethod;
  headers?: Record<string, string>;
  body?: TInput;
  signal?: AbortSignal;
}) => Promise<TOutput>;

export const createAPIMethods: CreateAPIMethods = async (opts) => {
  const response = await fetch(opts.url, {
    method: opts.method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(opts.body),
    signal: opts.signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
