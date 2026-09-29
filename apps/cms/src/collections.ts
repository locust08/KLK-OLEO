import {
  APIError,
  type CollectionConfig,
  type Field,
  type Where,
} from "payload";
import {
  checkRelatedSites,
  contentDelete,
  contentRead,
  contentWrite,
  enforceScope,
  hasRole,
  idOf,
  internalRead,
  leadRead,
  publisherField,
  scopedCreate,
  siteIds,
  superAdmin,
  superAdminField,
  type ScopedUser,
} from "./access";

const site: Field = {
  name: "site",
  type: "relationship",
  relationTo: "sites",
  required: true,
  index: true,
  admin: { position: "sidebar" },
  filterOptions: ({ user }) =>
    !user || user.role === "super-admin"
      ? true
      : { id: { in: siteIds(user as ScopedUser) } },
};
const slug: Field = { name: "slug", type: "text", required: true, index: true };
const source: Field = {
  name: "sourceURL",
  type: "text",
  admin: { description: "Original website or spreadsheet URL." },
};
const contentAccess = {
  read: contentRead,
  readVersions: internalRead,
  create: scopedCreate,
  update: contentWrite,
  delete: contentDelete,
};
const versioned = (config: CollectionConfig): CollectionConfig => ({
  ...config,
  access: config.access ?? contentAccess,
  versions: { drafts: true, maxPerDoc: 20 },
  hooks: {
    beforeChange: [
      enforceScope,
      checkRelatedSites,
      ...(config.hooks?.beforeChange ?? []),
    ],
  },
  fields: [
    site,
    ...config.fields,
    {
      name: "_status",
      type: "select",
      options: ["draft", "published"],
      defaultValue: "draft",
      access: { create: publisherField, update: publisherField },
      admin: { position: "sidebar" },
    },
  ],
});

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: { useAsTitle: "email", group: "Administration" },
  access: {
    create: superAdmin,
    delete: superAdmin,
    read: ({ req }) =>
      req.user?.role === "super-admin"
        ? true
        : req.user
          ? { id: { equals: req.user.id } }
          : false,
    update: ({ req }) =>
      req.user?.role === "super-admin"
        ? true
        : req.user
          ? { id: { equals: req.user.id } }
          : false,
    admin: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: "name", type: "text" },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "viewer",
      options: [
        "super-admin",
        "site-admin",
        "editor",
        "publisher",
        "lead-manager",
        "viewer",
      ],
      access: { create: superAdminField, update: superAdminField },
    },
    {
      name: "sites",
      type: "relationship",
      relationTo: "sites",
      hasMany: true,
      access: { create: superAdminField, update: superAdminField },
    },
  ],
};

export const Sites: CollectionConfig = {
  slug: "sites",
  admin: { useAsTitle: "name", group: "Administration" },
  access: {
    read: ({ req }) =>
      !req.user
        ? ({ active: { equals: true } } as Where)
        : req.user.role === "super-admin"
          ? true
          : ({ id: { in: siteIds(req.user as ScopedUser) } } as Where),
    create: superAdmin,
    update: superAdmin,
    delete: superAdmin,
  },
  hooks: {
    beforeChange: [
      async ({ req, data, originalDoc }) => {
        const kind = data.kind ?? originalDoc?.kind;
        const parent = idOf(data.parentSite ?? originalDoc?.parentSite);
        if (kind === "main" && parent)
          throw new APIError("The main site cannot have a parent.", 400);
        if (kind === "minisite") {
          if (!parent)
            throw new APIError("A minisite requires a main-site parent.", 400);
          if (String(parent) === String(originalDoc?.id))
            throw new APIError("A site cannot be its own parent.", 400);
          const main = await req.payload.findByID({
            collection: "sites",
            id: parent,
            req,
            depth: 0,
          });
          if (main.kind !== "main")
            throw new APIError(
              "Minisites must belong directly to the main site.",
              400,
            );
        }
        return data;
      },
    ],
  },
  fields: [
    { name: "name", type: "text", required: true },
    { ...slug, unique: true },
    {
      name: "kind",
      type: "select",
      required: true,
      options: ["main", "minisite"],
    },
    { name: "parentSite", type: "relationship", relationTo: "sites" },
    { name: "domain", type: "text", required: true },
    { name: "active", type: "checkbox", defaultValue: true },
    { name: "market", type: "text" },
    { name: "brandName", type: "text" },
    { name: "parentLinkLabel", type: "text", defaultValue: "Part of KLK OLEO" },
    {
      name: "navigation",
      type: "array",
      fields: [
        { name: "label", type: "text", required: true },
        { name: "path", type: "text", required: true },
      ],
    },
    { name: "contactEmail", type: "email" },
  ],
};

const taxonomy = (collectionSlug: string, label: string): CollectionConfig =>
  versioned({
    slug: collectionSlug,
    admin: { useAsTitle: "name", group: "Product catalogue" },
    indexes: [{ fields: ["site", "slug"], unique: true }],
    fields: [
      { name: "name", type: "text", required: true },
      slug,
      { name: "description", type: "textarea", admin: { description: label } },
    ],
  });
export const ProductFunctions = taxonomy(
  "product-functions",
  "Functions in agrochemical formulations.",
);
export const FormulationTypes = taxonomy(
  "formulation-types",
  "Formulation technology or type.",
);
export const RegulatoryLabels = taxonomy(
  "regulatory-labels",
  "Source-reported label. Verification is required before publishing claims.",
);

export const Products = versioned({
  slug: "products",
  admin: {
    useAsTitle: "name",
    group: "Product catalogue",
    defaultColumns: [
      "name",
      "chemicalDescription",
      "manufacturingRegion",
      "_status",
    ],
  },
  indexes: [{ fields: ["site", "slug"], unique: true }],
  fields: [
    { name: "name", type: "text", required: true },
    slug,
    { name: "chemicalDescription", type: "text", required: true },
    { name: "description", type: "textarea", required: true },
    {
      name: "functions",
      type: "relationship",
      relationTo: "product-functions",
      hasMany: true,
    },
    {
      name: "formulationTypes",
      type: "relationship",
      relationTo: "formulation-types",
      hasMany: true,
    },
    {
      name: "regulatoryLabels",
      type: "relationship",
      relationTo: "regulatory-labels",
      hasMany: true,
    },
    {
      name: "claimsReview",
      type: "select",
      required: true,
      defaultValue: "source-only",
      options: ["source-only", "verified", "needs-correction"],
      access: { update: publisherField },
      admin: {
        description:
          "Spreadsheet ticks are source claims, not independently validated certifications.",
      },
    },
    {
      name: "casNumber",
      type: "text",
      admin: {
        description:
          "Source value retained, including mixtures and proprietary entries.",
      },
    },
    {
      name: "manufacturingRegion",
      type: "select",
      options: [
        { label: "Europe (EU)", value: "EU" },
        { label: "Malaysia (MY)", value: "MY" },
      ],
    },
    {
      name: "resources",
      type: "relationship",
      relationTo: "resources",
      hasMany: true,
    },
    { name: "image", type: "upload", relationTo: "media" },
    { name: "featured", type: "checkbox", defaultValue: false },
    { name: "sourceNumber", type: "number" },
    { name: "sourceRow", type: "number" },
    source,
    {
      name: "sourceDocument",
      type: "text",
      admin: {
        description:
          "Reference filename only. No approved downloadable material exists yet.",
      },
    },
    {
      name: "sourceCells",
      type: "json",
      access: { read: ({ req }) => Boolean(req.user) },
      admin: { readOnly: true },
    },
    {
      name: "seo",
      type: "group",
      fields: [
        { name: "title", type: "text" },
        { name: "description", type: "textarea" },
      ],
    },
  ],
});

export const Media: CollectionConfig = {
  slug: "media",
  upload: { staticDir: "media", mimeTypes: ["image/*", "application/pdf"] },
  admin: { useAsTitle: "alt", group: "Content" },
  access: {
    read: ({ req }) =>
      req.user ? internalRead({ req }) : { isPublic: { equals: true } },
    create: scopedCreate,
    update: contentWrite,
    delete: contentDelete,
  },
  hooks: { beforeChange: [enforceScope] },
  fields: [
    site,
    { name: "alt", type: "text", required: true },
    { name: "caption", type: "text" },
    {
      name: "isPublic",
      type: "checkbox",
      defaultValue: false,
      access: { create: publisherField, update: publisherField },
      admin: {
        description: "Enable for approved public website images and downloads.",
      },
    },
  ],
};
export const Pages = versioned({
  slug: "pages",
  admin: { useAsTitle: "title", group: "Content" },
  indexes: [{ fields: ["site", "slug"], unique: true }],
  fields: [
    { name: "title", type: "text", required: true },
    slug,
    {
      name: "template",
      type: "select",
      options: [
        "home",
        "standard",
        "product-finder",
        "resource-library",
        "contact",
      ],
      required: true,
    },
    {
      name: "hero",
      type: "group",
      fields: [
        { name: "eyebrow", type: "text" },
        { name: "heading", type: "text" },
        { name: "body", type: "textarea" },
        { name: "image", type: "upload", relationTo: "media" },
      ],
    },
    {
      name: "sections",
      type: "array",
      fields: [
        { name: "heading", type: "text" },
        { name: "body", type: "textarea" },
      ],
    },
    {
      name: "seo",
      type: "group",
      fields: [
        { name: "title", type: "text" },
        { name: "description", type: "textarea" },
      ],
    },
    source,
  ],
});
export const Banners = versioned({
  slug: "banners",
  admin: { useAsTitle: "title", group: "Content" },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "placement", type: "text", required: true },
    { name: "headline", type: "text", required: true },
    { name: "body", type: "textarea" },
    { name: "desktopImage", type: "upload", relationTo: "media" },
    { name: "mobileImage", type: "upload", relationTo: "media" },
    { name: "ctaLabel", type: "text" },
    { name: "ctaPath", type: "text" },
    { name: "displayOrder", type: "number", defaultValue: 0 },
    source,
  ],
});
export const Resources = versioned({
  slug: "resources",
  admin: { useAsTitle: "title", group: "Content" },
  indexes: [{ fields: ["site", "slug"], unique: true }],
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, req }) => {
        const availability = data.availability ?? originalDoc?.availability;
        const file = idOf(data.file ?? originalDoc?.file);
        if (availability === "available" && !file)
          throw new APIError(
            "Available resources require an approved uploaded file.",
            400,
          );
        if (availability === "placeholder") data.file = null;
        const thumbnail = idOf(data.thumbnail === undefined ? originalDoc?.thumbnail : data.thumbnail);
        if (thumbnail) {
          const media = await req.payload.findByID({
            collection: "media", id: thumbnail, depth: 0, req, overrideAccess: true,
          });
          if (!media.mimeType?.startsWith("image/"))
            throw new APIError("Resource thumbnails must be uploaded images, not PDFs.", 400);
        }
        return data;
      },
    ],
  },
  fields: [
    { name: "title", type: "text", required: true },
    slug,
    { name: "description", type: "textarea" },
    {
      name: "type",
      type: "select",
      options: [
        "brochure",
        "technical-guide",
        "safety-data-sheet",
        "case-study",
      ],
      required: true,
    },
    {
      name: "availability",
      type: "select",
      options: ["placeholder", "available"],
      defaultValue: "placeholder",
      required: true,
    },
    { name: "placeholderLabel", type: "text", defaultValue: "Coming soon" },
    { name: "file", type: "upload", relationTo: "media" },
    {
      name: "thumbnail",
      type: "upload",
      relationTo: "media",
      filterOptions: { mimeType: { contains: "image/" } },
      admin: { description: "Document cover image. Set its Media isPublic flag to display it on the website; this is independent of PDF download visibility." },
    },
  ],
});
export const RoutingProfiles: CollectionConfig = {
  slug: "routing-profiles",
  admin: { useAsTitle: "name", group: "Lead operations" },
  access: {
    read: leadRead,
    create: superAdmin,
    update: superAdmin,
    delete: superAdmin,
  },
  fields: [
    site,
    { name: "name", type: "text", required: true },
    slug,
    {
      name: "purpose",
      type: "select",
      required: true,
      options: [
        "general-enquiry",
        "product-enquiry",
        "sample-request",
        "technical-support",
      ],
    },
    {
      name: "mode",
      type: "select",
      options: ["manual", "crm"],
      defaultValue: "manual",
      required: true,
    },
    {
      name: "connectorKey",
      type: "text",
      admin: {
        description: "Server-side adapter key; never put CRM credentials here.",
      },
    },
    { name: "destinationTeam", type: "text" },
    {
      name: "rules",
      type: "json",
      admin: {
        description:
          "Reserved for a versioned routing engine. Not executed in this initial release.",
      },
    },
  ],
};
export const Forms = versioned({
  slug: "forms",
  admin: { useAsTitle: "name", group: "Lead operations" },
  indexes: [{ fields: ["site", "slug"], unique: true }],
  fields: [
    { name: "name", type: "text", required: true },
    slug,
    {
      name: "purpose",
      type: "select",
      required: true,
      options: [
        "general-enquiry",
        "product-enquiry",
        "sample-request",
        "technical-support",
      ],
    },
    {
      name: "routingProfile",
      type: "relationship",
      relationTo: "routing-profiles",
      required: true,
      access: {
        read: ({ req }) => Boolean(req.user),
        update: superAdminField,
        create: superAdminField,
      },
    },
    { name: "consentLabel", type: "textarea", required: true },
    {
      name: "successMessage",
      type: "text",
      defaultValue: "Thank you. Your enquiry has been received.",
    },
  ],
});
export const Leads: CollectionConfig = {
  slug: "leads",
  admin: { useAsTitle: "email", group: "Lead operations" },
  access: {
    read: leadRead,
    create: () => false,
    update: leadRead,
    delete: superAdmin,
  },
  hooks: { beforeChange: [enforceScope] },
  fields: [
    site,
    { name: "form", type: "relationship", relationTo: "forms", required: true },
    { name: "purpose", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "firstName", type: "text", required: true },
    { name: "lastName", type: "text" },
    { name: "company", type: "text" },
    { name: "country", type: "text" },
    { name: "message", type: "textarea" },
    { name: "product", type: "relationship", relationTo: "products" },
    { name: "consentAt", type: "date", required: true },
    { name: "consentText", type: "textarea", required: true },
    {
      name: "routingProfile",
      type: "relationship",
      relationTo: "routing-profiles",
      access: { update: superAdminField },
    },
    {
      name: "deliveryStatus",
      type: "select",
      options: ["manual-review", "pending", "delivered", "failed"],
      defaultValue: "manual-review",
    },
    {
      name: "idempotencyKey",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { readOnly: true },
    },
  ],
};
export const collections = [
  Users,
  Sites,
  Media,
  ProductFunctions,
  FormulationTypes,
  RegulatoryLabels,
  Products,
  Pages,
  Banners,
  Resources,
  RoutingProfiles,
  Forms,
  Leads,
];
