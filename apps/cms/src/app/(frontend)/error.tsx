"use client";
import { useEffect } from "react";
export default function ContentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("CMS page content unavailable", error);
  }, [error]);
  return (
    <main role="alert" className="section-shell">
      <h1>Content temporarily unavailable</h1>
      <p>Please try again shortly.</p>
      <button type="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
