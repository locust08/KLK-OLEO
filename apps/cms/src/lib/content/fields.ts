import type { Field } from "payload";
import { safeEditorialLink, sectionKeys, sectionRules } from "./model";
const text = (name: string): Field => ({ name, type: "text" });
export const linkValidation = (v: unknown) =>
  !v ||
  safeEditorialLink(v) ||
  "Use an existing internal route, HTTPS, email or telephone link.";
export const imageField = (name = "image"): Field => ({
  name,
  type: "upload",
  relationTo: "media",
});
export const linkFields: Field[] = [
  { name: "label", type: "text", required: true },
  { name: "path", type: "text", required: true, validate: linkValidation },
  { name: "newTab", type: "checkbox", defaultValue: false },
];
export const seoFields: Field[] = [
  text("title"),
  { name: "description", type: "textarea" },
  imageField("socialImage"),
  {
    name: "canonical",
    type: "text",
    validate: (v: unknown) =>
      !v ||
      (/^https:\/\//.test(String(v)) && safeEditorialLink(v)) ||
      "Use an absolute HTTPS canonical URL.",
  },
];
const sectionFields = (key: string): Field[] => {
  const fields: Field[] = [
    { name: "enabled", type: "checkbox", defaultValue: false },
    ...(key === "globalPresence" ? [] : [text("eyebrow")]),
    text("heading"),
  ];
  if (["introduction", "finder", "contact"].includes(key))
    fields.push({ name: "body", type: "textarea" });
  if (["agriculture", "brandStory"].includes(key))
    fields.push({
      name: "paragraphs",
      type: "array",
      fields: [{ name: "text", type: "textarea", required: true }],
    });
  if (key === "introduction")
    fields.push({
      name: "bullets",
      type: "array",
      admin: { condition: (data) => data.slug === "home" },
      fields: [{ name: "text", type: "textarea", required: true }],
    });
  if (
    [
      "introduction",
      "innovations",
      "contact",
      "agriculture",
      "brandStory",
    ].includes(key)
  )
    fields.push(imageField(), imageField("mobileImage"));
  if (key === "research")
    fields.push({
      name: "images",
      type: "array",
      maxRows: 3,
      fields: [imageField()],
    });
  if (
    ["capabilities", "innovations", "finder", "faq", "research"].includes(key)
  )
    fields.push({
      name: "items",
      type: "array",
      maxRows: (
        { capabilities: 4, innovations: 2, finder: 3, research: 3 } as Record<
          string,
          number
        >
      )[key],
      fields: [
        { name: "heading", type: "text", required: true },
        { name: "body", type: "textarea", required: true },
        ...(key === "capabilities" ? [imageField()] : []),
        ...(key === "innovations"
          ? [
              text("label"),
              {
                name: "product",
                type: "relationship",
                relationTo: "products",
              } as Field,
            ]
          : []),
        ...(key === "finder"
          ? [
              {
                name: "category",
                type: "relationship",
                relationTo: "product-functions",
              } as Field,
            ]
          : []),
      ],
    });
  if (["introduction", "finder", "contact"].includes(key))
    fields.push(text("ctaLabel"), {
      name: "ctaPath",
      type: "text",
      validate: linkValidation,
    });
  return fields;
};
export const pageContentField: Field = {
  name: "content",
  type: "group",
  fields: sectionKeys.map((key) => ({
    name: key,
    type: "group",
    admin: {
      condition: (data) =>
        Boolean(
          sectionRules[data.slug]?.required.includes(key) ||
          sectionRules[data.slug]?.optional.includes(key),
        ),
    },
    fields: sectionFields(key),
  })),
};
