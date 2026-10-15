// Scope platform types without replacing the application's DOM/Node globals.
declare type D1Database = import("@cloudflare/workers-types").D1Database;
declare type R2Bucket = import("@cloudflare/workers-types").R2Bucket;
declare type Fetcher = import("@cloudflare/workers-types").Fetcher;
declare type ExecutionContext = import("@cloudflare/workers-types").ExecutionContext;
declare type Queue = import("@cloudflare/workers-types").Queue;
declare type BrowserRun = import("@cloudflare/workers-types").BrowserRun;
// This app uses HTTP service bindings only, without Worker RPC methods.
declare type Service<T = unknown> = import("@cloudflare/workers-types").Fetcher;
