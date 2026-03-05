"use client";

/**
 * API docs are rendered in an iframe so Swagger UI runs outside the React tree.
 * This avoids UNSAFE_componentWillReceiveProps warnings from swagger-ui-react.
 */
export default function ApiDocsPage() {
  return (
    <iframe
      src="/docs/swagger-ui"
      title="API Documentation"
      className="h-[calc(100vh-0px)] w-full border-0"
      sandbox="allow-scripts allow-same-origin"
    />
  );
}