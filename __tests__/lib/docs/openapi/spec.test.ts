import { getOpenApiSpec } from "@/lib/docs/openapi/spec";

describe("getOpenApiSpec", () => {
  it("returns valid OpenAPI 3 structure", () => {
    const spec = getOpenApiSpec("http://localhost:3000") as Record<string, unknown>;
    expect(spec.openapi).toBe("3.0.3");
    expect(spec.info).toEqual(
      expect.objectContaining({
        title: "Todo List API",
        version: "1.0.0",
      })
    );
    expect(spec.servers).toHaveLength(1);
    expect((spec.servers as { url: string }[])[0].url).toBe("http://localhost:3000");
  });

  it("includes Session, Auth, Better Auth, and Todos paths", () => {
    const spec = getOpenApiSpec("http://test") as { paths: Record<string, unknown> };
    const paths = spec.paths;
    expect(paths["/api/session"]).toBeDefined();
    expect(paths["/api/logout"]).toBeDefined();
    expect(paths["/api/auth/firebase"]).toBeDefined();
    expect(paths["/api/auth/{path}"]).toBeDefined();
    expect(paths["/api/todos"]).toBeDefined();
    expect(paths["/api/todos/{id}"]).toBeDefined();
  });

  it("includes Todo and Error schemas", () => {
    const spec = getOpenApiSpec("http://test") as {
      components: { schemas: Record<string, unknown> };
    };
    const schemas = spec.components.schemas;
    expect(schemas.Todo).toBeDefined();
    expect(schemas.Error).toBeDefined();
    expect(schemas.CreateTodoInput).toBeDefined();
    expect(schemas.UpdateTodoInput).toBeDefined();
  });
});