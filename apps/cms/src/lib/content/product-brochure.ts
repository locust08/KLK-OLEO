import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import type { ProductViewModel } from "../cms/view-models";
export type BrochureOptions = {
  generatedAt?: Date;
  draft?: boolean;
  regularFont?: Uint8Array;
  boldFont?: Uint8Array;
  imageBytes?: Uint8Array;
  labels?: Record<string, string | undefined>;
};
const templateVersion = "agrochemical-product-a4-v1";
async function digest(bytes: Uint8Array) {
  return Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", bytes as Uint8Array<ArrayBuffer>),
    ),
  )
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
export async function productRevision(
  p: ProductViewModel,
  options: Pick<BrochureOptions, "imageBytes" | "labels"> = {},
) {
  const visible = {
    templateVersion,
    name: p.name,
    type: p.type,
    summary: p.summary,
    functions: p.functionalities,
    formulations: p.formulations,
    labels: p.labels,
    manufacturingSite: p.manufacturingSite,
    casNumber: p.casNumber,
    image: options.imageBytes
      ? await digest(options.imageBytes)
      : (p.imageUrl ?? null),
    copy: options.labels ?? null,
  };
  return (
    await digest(new TextEncoder().encode(JSON.stringify(visible)))
  ).slice(0, 16);
}
export async function generateProductPdf(
  product: ProductViewModel,
  options: BrochureOptions = {},
) {
  if (product.summary.length > 80000)
    throw Error("Product content exceeds brochure limits.");
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const normal = options.regularFont
    ? await doc.embedFont(options.regularFont, { subset: true })
    : await doc.embedFont(StandardFonts.Helvetica);
  const bold = options.boldFont
    ? await doc.embedFont(options.boldFont, { subset: true })
    : await doc.embedFont(StandardFonts.HelveticaBold);
  doc.setTitle(product.name);
  doc.setSubject("Product information");
  doc.setCreator("KLK OLEO Agrochemical CMS");
  doc.setCreationDate(options.generatedAt ?? new Date());
  const revision = await productRevision(product, options);
  const green = rgb(1 / 255, 104 / 255, 54 / 255),
    gold = rgb(0.663, 0.592, 0.404),
    ink = rgb(0.15, 0.15, 0.15);
  const width = 595.28,
    height = 841.89,
    margin = 48,
    usable = width - margin * 2;
  let page: PDFPage;
  let y = 0;
  const newPage = () => {
    if (doc.getPageCount() >= 100) throw Error("Brochure page limit exceeded.");
    page = doc.addPage([width, height]);
    y = height - margin;
  };
  newPage();
  const ensure = (space: number) => {
    if (y - space < margin) newPage();
  };
  const wrap = (text: string, size: number, font: PDFFont) => {
    const lines: string[] = [];
    for (const para of text.split("\n")) {
      let line = "";
      for (const word of para.split(/\s+/)) {
        if (!word) continue;
        let rest = word;
        while (font.widthOfTextAtSize(rest, size) > usable) {
          let cut = rest.length;
          while (
            cut > 1 &&
            font.widthOfTextAtSize(rest.slice(0, cut), size) > usable
          )
            cut--;
          if (line) {
            lines.push(line);
            line = "";
          }
          lines.push(rest.slice(0, cut));
          rest = rest.slice(cut);
        }
        if (
          font.widthOfTextAtSize(line ? `${line} ${rest}` : rest, size) > usable
        ) {
          lines.push(line);
          line = rest;
        } else line = line ? `${line} ${rest}` : rest;
      }
      lines.push(line);
    }
    return lines;
  };
  const text = (value: string, size = 10, font = normal, color = ink) => {
    for (const line of wrap(value, size, font)) {
      ensure(size * 1.8);
      page.drawText(line, { x: margin, y: y - size, size, font, color });
      y -= size * 1.8;
    }
    y -= 8;
  };
  const heading = (value: string, size: number, next = 24) => {
    const needed = wrap(value, size, bold).length * size * 1.8 + 8 + next;
    if (needed > height - margin * 2)
      throw Error("Brochure heading exceeds printable page size.");
    ensure(needed);
    text(value, size, bold, green);
  };
  if (options.draft) text("DRAFT — NOT FOR DISTRIBUTION", 11, bold, green);
  heading(product.name, 24, wrap(product.type, 14, bold).length * 25.2 + 60);
  heading(product.type, 14, 60);
  page!.drawRectangle({
    x: margin,
    y: y - 4,
    width: usable,
    height: 3,
    color: gold,
  });
  y -= 22;
  text(
    `Generated: ${(options.generatedAt ?? new Date()).toISOString().slice(0, 10)}   Revision: ${revision}`,
    8,
    normal,
  );
  if (options.imageBytes) {
    if (options.imageBytes.byteLength > 8 * 1024 * 1024)
      throw Error("Image exceeds brochure limit.");
    const b = options.imageBytes;
    const img = b[0] === 137 ? await doc.embedPng(b) : await doc.embedJpg(b);
    const factor = Math.min(usable / img.width, 200 / img.height);
    const w = img.width * factor,
      h = img.height * factor;
    ensure(h + 16);
    page!.drawImage(img, { x: margin, y: y - h, width: w, height: h });
    y -= h + 16;
  }
  text(product.summary);
  const labels = options.labels ?? {};
  for (const [heading, values] of [
    [labels.detailFunction ?? "Functionalities", product.functionalities],
    [labels.detailFormulation ?? "Formulation Type", product.formulations],
    [labels.detailRegulation ?? "Regulatory/Labels", product.labels],
  ] as [string, string[]][]) {
    if (!values.length) continue;
    ensure(
      Math.min(height - margin * 2, wrap(heading, 12, bold).length * 21.6 + 36),
    );
    text(heading, 12, bold, green);
    for (const value of values) text(value);
  }
  const rows = [
    [
      labels.manufacturingSite ?? "Manufacturing Site",
      product.manufacturingSite,
    ],
    [labels.casNumber ?? "CAS Number", product.casNumber],
  ].filter(([, value]) => value && value !== "Not specified");
  if (rows.length) {
    ensure(80);
    text(labels.productInformation ?? "Product Information", 12, bold, green);
    for (const [label, value] of rows) {
      ensure(40);
      text(`${label}: ${value}`);
    }
  }
  return doc.save();
}
