jest.mock("better-auth/next-js", () => ({
  toNextJsHandler: jest.fn(() => ({ GET: jest.fn(), POST: jest.fn() })),
}));

jest.mock("@/lib/auth-server", () => ({
  auth: { api: {} },
}));

import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth-server";
import { GET, POST } from "@/app/api/auth/[...all]/route";

describe("/api/auth/[...all] route wiring", () => {
  it("passes auth to toNextJsHandler", () => {
    expect(toNextJsHandler).toHaveBeenCalledWith(auth);
  });

  it("re-exports GET and POST handlers from Better Auth", () => {
    const handlerResult = (toNextJsHandler as jest.Mock).mock.results[0].value as {
      GET: unknown;
      POST: unknown;
    };

    expect(GET).toBe(handlerResult.GET);
    expect(POST).toBe(handlerResult.POST);
  });
});
