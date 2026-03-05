/**
 * OpenAPI 3.0 specification for the Todo List application API.
 * Used by Swagger UI at /docs.
 */

const API_TITLE = "Todo List API";
const API_VERSION = "1.0.0";
const API_DESCRIPTION = `
API for the Todo List application. Covers authentication (Firebase and Better Auth), session management, logout, and Todo CRUD.

- **Firebase**: Google sign-in and session creation via ID token.
- **Better Auth**: Email/password sign-up and sign-in (handled under \`/api/auth/*\`).
- **Session**: Session cookie is set by the server; subsequent requests require the cookie.
- **Todos**: CRUD for todo items; requires an authenticated session (cookie).
`;

export function getOpenApiSpec(baseUrl: string): object {
  return {
    openapi: "3.0.3",
    info: {
      title: API_TITLE,
      version: API_VERSION,
      description: API_DESCRIPTION,
    },
    servers: [{ url: baseUrl, description: "Current origin" }],
    tags: [
      { name: "Session", description: "Firebase session (cookie-based)" },
      { name: "Auth", description: "Firebase and Better Auth" },
      { name: "Better Auth", description: "Email/password and session (Better Auth)" },
      { name: "Todos", description: "Todo list CRUD (requires session cookie)" },
    ],
    paths: {
      "/api/session": {
        post: {
          tags: ["Session"],
          summary: "Create session from Firebase ID token",
          description:
            "Verifies the Firebase ID token (Bearer), then sets an httpOnly session cookie. Used after client-side Firebase sign-in.",
          operationId: "createSession",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "Session created successfully",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/SessionSuccess" },
                },
              },
            },
            "401": {
              description: "Missing or invalid Authorization header or token",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
      },
      "/api/logout": {
        post: {
          tags: ["Session"],
          summary: "Log out",
          description: "Clears the session cookie. No request body required.",
          operationId: "logout",
          responses: {
            "200": {
              description: "Logged out successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { message: { type: "string", example: "Logged out" } },
                  },
                },
              },
            },
          },
        },
      },
      "/api/auth/firebase": {
        post: {
          tags: ["Auth"],
          summary: "Firebase auth and user sync",
          description:
            "Verifies Firebase ID token, creates or updates the user in the database (Prisma), and sets the session cookie. Use after Google (or Firebase email) sign-in.",
          operationId: "authFirebase",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "User synced and session set",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "success" },
                      userId: { type: "string", description: "Prisma User id" },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Invalid token or email missing in token",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
      },
      "/api/auth/{path}": {
        get: {
          tags: ["Better Auth"],
          summary: "Better Auth (GET)",
          description:
            "Better Auth catch-all: get-session and other GET handlers. Path is determined by Better Auth (e.g. get-session).",
          operationId: "betterAuthGet",
          parameters: [
            {
              name: "path",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Better Auth path segment(s), e.g. get-session",
            },
          ],
          responses: {
            "200": { description: "Success (shape depends on path)" },
            "401": { description: "Unauthorized" },
          },
        },
        post: {
          tags: ["Better Auth"],
          summary: "Better Auth (POST)",
          description:
            "Better Auth catch-all: sign-in/email, sign-up/email, sign-out, etc. Request body depends on the path. Cookies are used for session.",
          operationId: "betterAuthPost",
          parameters: [
            {
              name: "path",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Better Auth path, e.g. sign-in/email, sign-up/email, sign-out",
            },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  description: "Varies by endpoint (e.g. email, password, name for sign-up)",
                },
              },
            },
          },
          responses: {
            "200": { description: "Success (shape depends on path)" },
            "400": { description: "Bad request (e.g. validation)" },
            "401": { description: "Unauthorized" },
          },
        },
      },
      "/api/todos": {
        get: {
          tags: ["Todos"],
          summary: "List todos",
          description: "Returns all todos for the authenticated user. Requires session cookie.",
          operationId: "listTodos",
          security: [{ cookieAuth: [] }],
          responses: {
            "200": {
              description: "List of todos",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Todo" },
                  },
                },
              },
            },
            "401": {
              description: "Not authenticated",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/Error" } },
              },
            },
          },
        },
        post: {
          tags: ["Todos"],
          summary: "Create todo",
          description: "Creates a new todo for the authenticated user. Requires session cookie.",
          operationId: "createTodo",
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateTodoInput" },
              },
            },
          },
          responses: {
            "201": {
              description: "Todo created",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/Todo" } },
              },
            },
            "400": {
              description: "Validation error (e.g. missing title)",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/Error" } },
              },
            },
            "401": {
              description: "Not authenticated",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/Error" } },
              },
            },
          },
        },
      },
      "/api/todos/{id}": {
        patch: {
          tags: ["Todos"],
          summary: "Update todo",
          description: "Updates an existing todo by id. Only the owner can update. Requires session cookie.",
          operationId: "updateTodo",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Todo id (cuid)",
            },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UpdateTodoInput" },
              },
            },
          },
          responses: {
            "200": {
              description: "Todo updated",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/Todo" } },
              },
            },
            "400": {
              description: "Validation error",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/Error" } },
              },
            },
            "401": {
              description: "Not authenticated",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/Error" } },
              },
            },
            "404": {
              description: "Todo not found",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/Error" } },
              },
            },
          },
        },
        delete: {
          tags: ["Todos"],
          summary: "Delete todo",
          description: "Deletes a todo by id. Only the owner can delete. Requires session cookie.",
          operationId: "deleteTodo",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Todo id (cuid)",
            },
          ],
          responses: {
            "204": { description: "Todo deleted" },
            "401": {
              description: "Not authenticated",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/Error" } },
              },
            },
            "404": {
              description: "Todo not found",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/Error" } },
              },
            },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "Firebase ID Token",
          description: "Firebase ID token from the client (e.g. after signInWithPopup).",
        },
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "session",
          description: "Session cookie set after sign-in (Firebase or Better Auth). Send automatically by the browser.",
        },
      },
      schemas: {
        SessionSuccess: {
          type: "object",
          properties: { status: { type: "string", example: "success" } },
        },
        Error: {
          type: "object",
          properties: { error: { type: "string" } },
        },
        Todo: {
          type: "object",
          properties: {
            id: { type: "string", description: "Todo id (cuid)" },
            title: { type: "string" },
            description: { type: "string", nullable: true },
            completed: { type: "boolean", default: false },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        CreateTodoInput: {
          type: "object",
          required: ["title"],
          properties: {
            title: { type: "string", minLength: 1, maxLength: 500 },
            description: { type: "string", maxLength: 1000, nullable: true },
          },
        },
        UpdateTodoInput: {
          type: "object",
          minProperties: 1,
          properties: {
            title: { type: "string", minLength: 1, maxLength: 500 },
            description: { type: "string", maxLength: 1000, nullable: true },
            completed: { type: "boolean" },
          },
        },
      },
    },
  };
}