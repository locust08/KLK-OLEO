"use client";
import { useEffect, useRef, useState } from "react";
import { pdfFilename } from "@/lib/product-pdf/version";

export function ProductBrochureButton({ slug }: { slug: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  async function download() {
    if (controller.current) return;
    const abort = new AbortController();
    controller.current = abort;
    setBusy(true);
    setMessage("Preparing your brochure…");
    try {
      for (let attempt = 0; attempt < 40; attempt++) {
        const response = await fetch(`/api/product-pdf/${encodeURIComponent(slug)}`, { cache: "no-store", signal: abort.signal });
        if (response.status === 202) {
          await new Promise<void>((resolve, reject) => {
            const onAbort = () => { clearTimeout(timer); reject(new DOMException("Aborted", "AbortError")); };
            const timer = setTimeout(() => { abort.signal.removeEventListener("abort", onAbort); resolve(); }, 3000);
            abort.signal.addEventListener("abort", onAbort, { once: true });
          });
          continue;
        }
        if (!response.ok || !response.headers.get("Content-Type")?.includes("application/pdf")) {
          throw new Error(response.status === 404 ? "This product brochure is unavailable." : "The brochure is temporarily unavailable. Please try again shortly.");
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = pdfFilename(slug);
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 30_000);
        setMessage("Your brochure has downloaded.");
        return;
      }
      setMessage("Your brochure is still being prepared. Please try again shortly.");
    } catch (error) {
      if (!abort.signal.aborted) setMessage(error instanceof TypeError ? "Unable to connect. Please try again." : error instanceof Error ? error.message : "Brochure temporarily unavailable.");
    } finally {
      controller.current = null;
      if (!abort.signal.aborted) setBusy(false);
    }
  }
  return <span className="product-pdf-control">
    <button type="button" className="product-action product-action--outline" disabled={busy} aria-busy={busy} onClick={download}>Request Brochure</button>
    {message && <span className="product-pdf-status" role="status">{message}</span>}
  </span>;
}
