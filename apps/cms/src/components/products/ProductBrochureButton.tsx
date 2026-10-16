"use client";
import { useSite } from "@/components/layout/SiteContext";
import { useEffect, useRef, useState } from "react";
import { pdfFilename } from "@/lib/product-pdf/version";

export function ProductBrochureButton({ slug }: { slug: string }) {
  const { copy, draftPreview } = useSite();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  async function download() {
    if (controller.current) return;
    const abort = new AbortController();
    controller.current = abort;
    setBusy(true);
    setMessage(copy.brochureLoading ?? "");
    try {
      for (let attempt = 0; attempt < 40; attempt++) {
        const response = await fetch(
          draftPreview
            ? `/api/products/${encodeURIComponent(slug)}/brochure`
            : `/api/product-pdf/${encodeURIComponent(slug)}`,
          { cache: "no-store", signal: abort.signal },
        );
        if (response.status === 202) {
          await new Promise<void>((resolve, reject) => {
            const onAbort = () => {
              clearTimeout(timer);
              reject(new DOMException("Aborted", "AbortError"));
            };
            const timer = setTimeout(() => {
              abort.signal.removeEventListener("abort", onAbort);
              resolve();
            }, 3000);
            abort.signal.addEventListener("abort", onAbort, { once: true });
          });
          continue;
        }
        if (
          !response.ok ||
          !response.headers.get("Content-Type")?.includes("application/pdf")
        ) {
          throw new Error(copy.brochureError ?? "");
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download =
          response.headers
            .get("content-disposition")
            ?.match(/filename="([^"]+)"/)?.[1] || pdfFilename(slug);
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 30_000);
        setMessage(copy.brochureReady ?? "");
        return;
      }
      setMessage(copy.brochurePending ?? "");
    } catch (error) {
      if (!abort.signal.aborted) setMessage(copy.brochureError ?? "");
    } finally {
      controller.current = null;
      if (!abort.signal.aborted) setBusy(false);
    }
  }
  return (
    <span className="product-pdf-control">
      <button
        type="button"
        className="product-action product-action--outline"
        disabled={busy}
        aria-busy={busy}
        onClick={download}
      >
        {copy.brochure}
      </button>
      {message && (
        <span className="product-pdf-status" role="status">
          {message}
        </span>
      )}
    </span>
  );
}
