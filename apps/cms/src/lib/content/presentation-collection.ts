import type { CollectionConfig } from "payload";
import {
  scopedCreate,
  contentRead,
  contentWrite,
  contentDelete,
  enforceScope,
  checkRelatedSites,
  publisherField,
  internalRead,
} from "../../access";
import { imageField, linkFields } from "./fields";
import { interfaceKeys } from "./presentation";
export const SitePresentation: CollectionConfig = {
  slug: "site-presentation",
  admin: {
    useAsTitle: "name",
    group: "Content",
    preview: () => "/api/preview?path=/",
  },
  versions: { drafts: true, maxPerDoc: 20 },
  access: {
    read: contentRead,
    readVersions: internalRead,
    create: scopedCreate,
    update: contentWrite,
    delete: contentDelete,
  },
  hooks: { beforeChange: [enforceScope, checkRelatedSites] },
  indexes: [{ fields: ["site"], unique: true }],
  fields: [
    { name: "site", type: "relationship", relationTo: "sites", required: true },
    { name: "name", type: "text", required: true },
    { name: "brandName", type: "text", required: true },
    { name: "contactEmail", type: "email", required: true },
    {
      name: "navigation",
      type: "array",
      minRows: 1,
      maxRows: 6,
      fields: linkFields,
    },
    {
      name: "footer",
      type: "group",
      fields: [
        imageField("logo"),
        { name: "description", type: "textarea", required: true },
        { name: "socialLabel", type: "text" },
        {
          name: "socialPath",
          type: "text",
          validate: (v: unknown) =>
            !v || /^https:\/\//.test(String(v)) || "Use HTTPS.",
        },
        ...["quickLinks", "productLinks", "legalLinks"].map((name) => ({
          name,
          type: "array" as const,
          fields: linkFields,
        })),
      ],
    },
    {
      name: "copy",
      type: "array",
      fields: [
        {
          name: "key",
          type: "select",
          options: [...interfaceKeys],
          required: true,
        },
        { name: "text", type: "text", required: true },
      ],
    },
    {
      name: "catalogue",
      type: "group",
      fields: ["functionalities", "formulation-type", "regulatory-labels"].map(
        (name) => ({
          name: name.replaceAll("-", "_"),
          type: "group" as const,
          fields: [
            { name: "label", type: "text", required: true },
            { name: "description", type: "textarea" },
            { name: "showDescription", type: "checkbox", defaultValue: false },
          ],
        }),
      ),
    },
    {
      name: "_status",
      type: "select",
      options: ["draft", "published"],
      defaultValue: "draft",
      access: {
        create: (args) =>
          Boolean(args.req.context.editorialDraft) || publisherField(args),
        update: (args) =>
          Boolean(args.req.context.editorialDraft) || publisherField(args),
      },
    },
  ],
};
