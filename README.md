# WADS LAB WEEK 5 (TO DO LIST APP)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API Documentation

- Swagger UI: [http://localhost:3000/docs](http://localhost:3000/docs)

# API Design And Scenario Tables

## API Design Table

| Endpoint | Method | Purpose | Auth Requirement | Request Input | Success Response |
| --- | --- | --- | --- | --- | --- |
| `/api/auth/[...all]` | `GET` | Better Auth delegated GET handlers (ex: session checks) | Depends on Better Auth path | Path segment(s) handled by Better Auth | `200` (shape depends on Better Auth endpoint) |
| `/api/auth/[...all]` | `POST` | Better Auth delegated POST handlers (ex: sign-in/sign-up/sign-out) | Depends on Better Auth path | JSON body (depends on Better Auth endpoint) | `200` (shape depends on Better Auth endpoint) |
| `/api/auth/firebase` | `POST` | Verify Firebase token, sync user to DB, set `session` cookie | Bearer token (`Authorization: Bearer <idToken>`) | No JSON body required | `200` `{ status: "success", userId }` |
| `/api/session` | `POST` | Verify Firebase token and set `session` cookie | Bearer token | No JSON body required | `200` `{ status: "success" }` |
| `/api/logout` | `POST` | Clear `session` cookie | None | No body | `200` `{ message: "Logged out" }` |
| `/api/todos` | `GET` | List todos for current signed-in user | Valid session cookie | No body | `200` `Todo[]` |
| `/api/todos` | `POST` | Create a todo for current signed-in user | Valid session cookie | JSON `{ title, description? }` | `201` `Todo` |
| `/api/todos/{id}` | `PATCH` | Update todo by id for current user | Valid session cookie | JSON with at least one of `{ title, description, completed }` | `200` updated `Todo` |
| `/api/todos/{id}` | `DELETE` | Delete todo by id for current user | Valid session cookie | Path param `id` | `204` no body |
| `/api/docs/openapi` | `GET` | Return OpenAPI document for Swagger | None | No body | `200` OpenAPI JSON |

## Success/Error Scenario Table

| Endpoint | Success Scenarios | Error Scenarios |
| --- | --- | --- |
| `/api/auth/[...all]` (`GET`,`POST`) | Better Auth handler resolves and returns expected payload/cookies | Depends on Better Auth path and validation logic |
| `/api/auth/firebase` (`POST`) | Valid Bearer token with email -> user upserted, cookie set, `200` | Missing/invalid `Authorization` -> `401`; token without email -> `401`; verification failure -> `401` |
| `/api/session` (`POST`) | Valid Bearer token -> cookie set, `200` | Missing/invalid `Authorization` -> `401`; invalid token currently throws (unhandled in route) |
| `/api/logout` (`POST`) | Always clears cookie and returns `200` | No explicit error path in current implementation |
| `/api/todos` (`GET`) | Authenticated user -> ordered todo list, `200` | No session -> `401` |
| `/api/todos` (`POST`) | Authenticated + valid title -> todo created, `201` | No session -> `401`; invalid JSON -> `400`; empty/missing title -> `400` |
| `/api/todos/{id}` (`PATCH`) | Authenticated + valid payload + owned todo -> updated todo, `200` | No session -> `401`; missing id -> `400`; invalid JSON -> `400`; invalid payload -> `400`; not found/not owned -> `404` |
| `/api/todos/{id}` (`DELETE`) | Authenticated + owned todo -> deleted, `204` | No session -> `401`; missing id -> `400`; not found/not owned -> `404` |
| `/api/docs/openapi` (`GET`) | Returns OpenAPI spec JSON, `200` | No explicit error path in current implementation |

## Notes

- Session auth is cookie-based for todo endpoints.
- Firebase token auth (`Authorization: Bearer ...`) is used for `/api/auth/firebase` and `/api/session`.
- `api/session` can be hardened by wrapping `verifyIdToken` in `try/catch` and returning `401` consistently.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
