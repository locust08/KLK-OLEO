"use client";
import { useState } from "react";
import { FaDownload } from "react-icons/fa6";
import { useCopy } from "@/components/layout/SiteContext";
export function BrochureButton({ slug }: { slug: string }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(false);
  const copy = useCopy();
  return (
    <>
      <button
        className="product-action product-action--outline"
        disabled={busy}
        onClick={async () => {
          if (busy) return;
          setBusy(true);
          setError(false);
          try {
            const response = await fetch(
              `/api/products/${encodeURIComponent(slug)}/brochure`,
              { cache: "no-store" },
            );
            if (!response.ok) throw Error();
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download =
              response.headers
                .get("content-disposition")
                ?.match(/filename="([^"]+)"/)?.[1] || "product.pdf";
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          } catch {
            setError(true);
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? copy.brochureLoading : copy.brochure}
        <FaDownload aria-hidden="true" />
      </button>
      {error && <p role="alert">{copy.brochureError}</p>}
    </>
  );
}
