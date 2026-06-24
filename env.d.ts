/// <reference types="vite/client" />
/// <reference types="react-router" />
/// //<reference types="@shopify/oxygen-workers-types" />
/// <reference types="@shopify/hydrogen/react-router-types" />

declare global {
  interface ExecutionContext {
    waitUntil(promise: Promise<unknown>): void;
  }
}

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';

// react-dom/server.node does not ship its own types
declare module 'react-dom/server.node' {
  export {renderToReadableStream};
}
