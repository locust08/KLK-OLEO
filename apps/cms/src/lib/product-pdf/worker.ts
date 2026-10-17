import puppeteer from "@cloudflare/puppeteer";
import type { MessageBatch } from "@cloudflare/workers-types";
import { PdfCache, validPdf } from "./cache";
import { pdfFilename, type PdfSnapshot } from "./version";

export type PdfJob =
  { slug: string; revision?: string } | { sweep: true; page: number };
const noStore = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
};
const stateResponse = (status: number, message: string) =>
  Response.json(
    { message },
    {
      status,
      headers: { ...noStore, "Retry-After": "3" },
    },
  );

async function appFetch(env: CloudflareEnv, path: string) {
  return env.PDF_APP.fetch(
    new URL(path, env.NEXT_PUBLIC_SERVER_URL).toString(),
    { headers: { "Cache-Control": "no-cache" } },
  );
}
async function snapshotFor(
  env: CloudflareEnv,
  slug: string,
): Promise<PdfSnapshot | null> {
  const response = await appFetch(
    env,
    `/api/product-pdf-source/${encodeURIComponent(slug)}`,
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("SOURCE_UNAVAILABLE");
  return response.json();
}

async function enqueue(
  env: CloudflareEnv,
  cache: PdfCache,
  source: PdfSnapshot,
) {
  if (!(await cache.reserveQueue(source))) return;
  try {
    await env.PRODUCT_PDF_QUEUE.send({ slug: source.slug });
  } catch (error) {
    await cache.releaseQueue(source.productId, source.version);
    throw error;
  }
}

export async function downloadProductPdf(
  request: Request,
  env: CloudflareEnv,
  slug: string,
) {
  if (request.method !== "GET")
    return new Response(null, {
      status: 405,
      headers: { Allow: "GET", ...noStore },
    });
  try {
    const source = await snapshotFor(env, slug);
    if (!source)
      return stateResponse(404, "This product brochure is unavailable.");
    const cache = new PdfCache(env.D1);
    const row = await cache.observe(source);
    if (validPdf(row, source)) {
      const file = await env.R2.get(row.object_key);
      if (file) {
        // A publish can happen during the D1/R2 reads. Fail closed rather than return its predecessor.
        const latest = await snapshotFor(env, slug);
        if (!latest)
          return stateResponse(404, "This product brochure is unavailable.");
        if (latest.version !== source.version) {
          await cache.observe(latest);
          await enqueue(env, cache, latest);
          return stateResponse(202, "The updated brochure is being prepared.");
        }
        return new Response(file.body as ReadableStream, {
          headers: {
            ...noStore,
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${pdfFilename(source.product.name)}"`,
            "X-PDF-Version": source.version,
          },
        });
      }
      await cache.missingObject(source);
    }
    await enqueue(env, cache, source);
    return stateResponse(202, "Your brochure is being prepared. Please wait.");
  } catch (error) {
    console.error("product_pdf_download_failed", { slug, error });
    return stateResponse(
      503,
      "The brochure is temporarily unavailable. Please try again shortly.",
    );
  }
}

export async function renderProductPdf(
  env: CloudflareEnv,
  source: PdfSnapshot,
  headers?: Record<string, string>,
) {
  // Cloudflare's and Next's DOM fetch types differ; this is the same runtime binding.
  const browser = await puppeteer.launch(
    env.BROWSER as unknown as Parameters<typeof puppeteer.launch>[0],
  );
  try {
    const page = await browser.newPage();
    if (headers) await page.setExtraHTTPHeaders(headers);
    await page.setCacheEnabled(false);
    page.setDefaultTimeout(30_000);
    await page.setViewport({ width: 1100, height: 900 });
    // Only the configured application origin is visited; no user-provided URL or credentials.
    const url = new URL(
      `/products/product/${encodeURIComponent(source.slug)}/print`,
      env.NEXT_PUBLIC_SERVER_URL,
    );
    if (source.draft) url.searchParams.set("draft", "1");
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      const target = new URL(request.url());
      // Fonts and media are served by this same application. Block tracking and arbitrary outbound URLs.
      void (target.origin === url.origin || target.protocol === "data:"
        ? request.continue()
        : request.abort());
    });
    const response = await page.goto(url.toString(), {
      waitUntil: "networkidle0",
      timeout: 60_000,
    });
    if (!response?.ok()) throw new Error("PRINT_PAGE_UNAVAILABLE");
    await page.emulateMediaType("print");
    await page.waitForFunction(
      () =>
        document.fonts.status === "loaded" &&
        Array.from(document.images).every((image) => image.complete),
      { timeout: 30_000 },
    );
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(Array.from(document.images, (image) => image.decode()));
      // The shared contact banner uses a CSS background, not an <img> element.
      await Promise.all(
        Array.from(
          document.querySelectorAll(".product-pdf-contact"),
          async (element) => {
            const background = getComputedStyle(element).backgroundImage;
            const url = background.match(/^url\(["']?(.*?)["']?\)$/)?.[1];
            if (url) {
              const image = new Image();
              image.src = url;
              await image.decode();
            }
          },
        ),
      );
      if (
        Array.from(document.images).some(
          (image) => !image.complete || !image.naturalWidth,
        )
      )
        throw new Error("IMAGE_UNAVAILABLE");
    });
    const renderedVersion = await page.$eval("[data-pdf-version]", (element) =>
      element.getAttribute("data-pdf-version"),
    );
    if (renderedVersion !== source.version) throw new Error("PRODUCT_CHANGED");
    const pdf = await page.pdf({
      format: "A4",
      landscape: false,
      margin: { top: "15mm", bottom: "15mm", left: "15mm", right: "15mm" },
      printBackground: true,
      displayHeaderFooter: false,
      preferCSSPageSize: true,
      timeout: 30_000,
    });
    if (new TextDecoder().decode(pdf.slice(0, 5)) !== "%PDF-")
      throw new Error("INVALID_PDF");
    return pdf;
  } finally {
    await browser.close();
  }
}

export async function generateProductPdf(
  env: CloudflareEnv,
  job: { slug: string; revision?: string },
  render: (
    env: CloudflareEnv,
    source: PdfSnapshot,
  ) => Promise<Uint8Array> = renderProductPdf,
) {
  const source = await snapshotFor(env, job.slug);
  if (!source) {
    await env.D1.prepare(
      "UPDATE product_pdf_cache SET status='unavailable', updated_at=? WHERE product_slug=?",
    )
      .bind(Date.now(), job.slug)
      .run();
    return;
  }
  if (job.revision && source.revision < job.revision)
    throw new Error("PUBLISH_NOT_COMMITTED");
  const cache = new PdfCache(env.D1);
  const before = await cache.observe(source);
  if (validPdf(before, source)) return;
  const token = crypto.randomUUID();
  if (!(await cache.claim(source, token))) {
    // Redelivery while another consumer is working must not acknowledge the only recovery job.
    const current = await cache.get(source.productId);
    if (current?.status === "generating") throw new Error("GENERATION_BUSY");
    return;
  }
  const key = `product-pdfs/${source.productId}/${source.templateVersion}/${source.version}/${token}.pdf`;
  let uploaded = false;
  try {
    const pdf = await render(env, source);
    const latest = await snapshotFor(env, source.slug);
    if (!latest || latest.version !== source.version)
      throw new Error("PRODUCT_CHANGED");
    await env.R2.put(key, pdf, {
      httpMetadata: {
        contentType: "application/pdf",
        cacheControl: "private, no-store",
      },
    });
    uploaded = true;
    // The token and version fence late jobs, including expired leases and newly published content.
    const final = await snapshotFor(env, source.slug);
    if (!final || final.version !== source.version)
      throw new Error("PRODUCT_CHANGED");
    if (!(await cache.complete(source, token, key))) {
      await env.R2.delete(key);
      return;
    }
    // Previous file survives all failures. Delete it only after atomically promoting its replacement.
    if (before?.object_key && before.object_key !== key) {
      try {
        await env.R2.delete(before.object_key);
      } catch (error) {
        console.warn("product_pdf_old_object_cleanup_failed", {
          productId: source.productId,
          error,
        });
      }
    }
  } catch (error) {
    if (uploaded) await env.R2.delete(key).catch(() => undefined);
    await cache.fail(source, token, "GENERATION_FAILED");
    console.error("product_pdf_generation_failed", {
      productId: source.productId,
      version: source.version,
      error,
    });
    throw error;
  }
}

export async function productPdfQueue(
  batch: MessageBatch<PdfJob>,
  env: CloudflareEnv,
) {
  for (const message of batch.messages) {
    try {
      const job = message.body;
      if ("sweep" in job) {
        const response = await appFetch(
          env,
          `/api/product-pdf-source?page=${job.page}`,
        );
        if (!response.ok) throw new Error("SWEEP_SOURCE_UNAVAILABLE");
        const result = (await response.json()) as {
          slugs: string[];
          nextPage: number | null;
        };
        if (result.slugs.length)
          await env.PRODUCT_PDF_QUEUE.sendBatch(
            result.slugs.map((slug) => ({ body: { slug } })),
          );
        if (result.nextPage)
          await env.PRODUCT_PDF_QUEUE.send({
            sweep: true,
            page: result.nextPage,
          });
      } else {
        await generateProductPdf(env, job);
      }
      message.ack();
    } catch (error) {
      console.error("product_pdf_queue_retry", {
        attempt: message.attempts,
        error,
      });
      message.retry({
        delaySeconds: Math.min(300, 30 * 2 ** (message.attempts - 1)),
      });
    }
  }
}
