-- Additive editorial integration schema. Review and apply once after backup.

CREATE TABLE `site_presentation_navigation` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`label` text,
	`path` text,
	`new_tab` integer DEFAULT false,
	FOREIGN KEY (`_parent_id`) REFERENCES `site_presentation`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `site_presentation_footer_quick_links` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`label` text,
	`path` text,
	`new_tab` integer DEFAULT false,
	FOREIGN KEY (`_parent_id`) REFERENCES `site_presentation`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `site_presentation_footer_product_links` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`label` text,
	`path` text,
	`new_tab` integer DEFAULT false,
	FOREIGN KEY (`_parent_id`) REFERENCES `site_presentation`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `site_presentation_footer_legal_links` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`label` text,
	`path` text,
	`new_tab` integer DEFAULT false,
	FOREIGN KEY (`_parent_id`) REFERENCES `site_presentation`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `site_presentation_copy` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`key` text,
	`text` text,
	FOREIGN KEY (`_parent_id`) REFERENCES `site_presentation`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `site_presentation` (
	`id` integer PRIMARY KEY NOT NULL,
	`site_id` integer,
	`name` text,
	`brand_name` text,
	`contact_email` text,
	`footer_logo_id` integer,
	`footer_description` text,
	`footer_social_label` text,
	`footer_social_path` text,
	`catalogue_functionalities_label` text,
	`catalogue_functionalities_description` text,
	`catalogue_functionalities_show_description` integer DEFAULT false,
	`catalogue_formulation_type_label` text,
	`catalogue_formulation_type_description` text,
	`catalogue_formulation_type_show_description` integer DEFAULT false,
	`catalogue_regulatory_labels_label` text,
	`catalogue_regulatory_labels_description` text,
	`catalogue_regulatory_labels_show_description` integer DEFAULT false,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`_status` text DEFAULT 'draft',
	FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`footer_logo_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE TABLE `_site_presentation_v_version_navigation` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`id` integer PRIMARY KEY NOT NULL,
	`label` text,
	`path` text,
	`new_tab` integer DEFAULT false,
	`_uuid` text,
	FOREIGN KEY (`_parent_id`) REFERENCES `_site_presentation_v`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `_site_presentation_v_version_footer_quick_links` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`id` integer PRIMARY KEY NOT NULL,
	`label` text,
	`path` text,
	`new_tab` integer DEFAULT false,
	`_uuid` text,
	FOREIGN KEY (`_parent_id`) REFERENCES `_site_presentation_v`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `_site_presentation_v_version_footer_product_links` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`id` integer PRIMARY KEY NOT NULL,
	`label` text,
	`path` text,
	`new_tab` integer DEFAULT false,
	`_uuid` text,
	FOREIGN KEY (`_parent_id`) REFERENCES `_site_presentation_v`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `_site_presentation_v_version_footer_legal_links` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`id` integer PRIMARY KEY NOT NULL,
	`label` text,
	`path` text,
	`new_tab` integer DEFAULT false,
	`_uuid` text,
	FOREIGN KEY (`_parent_id`) REFERENCES `_site_presentation_v`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `_site_presentation_v_version_copy` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`id` integer PRIMARY KEY NOT NULL,
	`key` text,
	`text` text,
	`_uuid` text,
	FOREIGN KEY (`_parent_id`) REFERENCES `_site_presentation_v`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `_site_presentation_v` (
	`id` integer PRIMARY KEY NOT NULL,
	`parent_id` integer,
	`version_site_id` integer,
	`version_name` text,
	`version_brand_name` text,
	`version_contact_email` text,
	`version_footer_logo_id` integer,
	`version_footer_description` text,
	`version_footer_social_label` text,
	`version_footer_social_path` text,
	`version_catalogue_functionalities_label` text,
	`version_catalogue_functionalities_description` text,
	`version_catalogue_functionalities_show_description` integer DEFAULT false,
	`version_catalogue_formulation_type_label` text,
	`version_catalogue_formulation_type_description` text,
	`version_catalogue_formulation_type_show_description` integer DEFAULT false,
	`version_catalogue_regulatory_labels_label` text,
	`version_catalogue_regulatory_labels_description` text,
	`version_catalogue_regulatory_labels_show_description` integer DEFAULT false,
	`version_updated_at` text,
	`version_created_at` text,
	`version__status` text DEFAULT 'draft',
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`latest` integer,
	FOREIGN KEY (`parent_id`) REFERENCES `site_presentation`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`version_site_id`) REFERENCES `sites`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`version_footer_logo_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE TABLE `product_redirects` (
	`id` integer PRIMARY KEY NOT NULL,
	`site_id` integer NOT NULL,
	`from_slug` text NOT NULL,
	`product_id` integer NOT NULL,
	`_status` text DEFAULT 'published',
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE set null
);

ALTER TABLE "media" ADD COLUMN `custom_crop` integer DEFAULT false;

ALTER TABLE "media" ADD COLUMN `pdf_variant_id` integer;

ALTER TABLE "media" ADD COLUMN `pdf_status` text;

ALTER TABLE "products" ADD COLUMN `brochure_enabled` integer DEFAULT true;

ALTER TABLE "products" ADD COLUMN `seo_social_image_id` integer;

ALTER TABLE "products" ADD COLUMN `seo_canonical` text;

ALTER TABLE "_products_v" ADD COLUMN `version_brochure_enabled` integer DEFAULT true;

ALTER TABLE "_products_v" ADD COLUMN `version_seo_social_image_id` integer;

ALTER TABLE "_products_v" ADD COLUMN `version_seo_canonical` text;

CREATE TABLE `pages_content_introduction_bullets` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`text` text,
	FOREIGN KEY (`_parent_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `pages_content_capabilities_items` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`heading` text,
	`body` text,
	`image_id` integer,
	FOREIGN KEY (`image_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`_parent_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `pages_content_innovations_items` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`heading` text,
	`body` text,
	`label` text,
	`product_id` integer,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`_parent_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `pages_content_finder_items` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`heading` text,
	`body` text,
	`category_id` integer,
	FOREIGN KEY (`category_id`) REFERENCES `product_functions`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`_parent_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `pages_content_faq_items` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`heading` text,
	`body` text,
	FOREIGN KEY (`_parent_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `pages_content_agriculture_paragraphs` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`text` text,
	FOREIGN KEY (`_parent_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `pages_content_brand_story_paragraphs` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`text` text,
	FOREIGN KEY (`_parent_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `pages_content_research_images` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`image_id` integer,
	FOREIGN KEY (`image_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`_parent_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `pages_content_research_items` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`heading` text,
	`body` text,
	FOREIGN KEY (`_parent_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE cascade
);

ALTER TABLE "pages" ADD COLUMN `integration_version` numeric;

ALTER TABLE "pages" ADD COLUMN `content_introduction_enabled` integer DEFAULT false;

ALTER TABLE "pages" ADD COLUMN `content_introduction_eyebrow` text;

ALTER TABLE "pages" ADD COLUMN `content_introduction_heading` text;

ALTER TABLE "pages" ADD COLUMN `content_introduction_body` text;

ALTER TABLE "pages" ADD COLUMN `content_introduction_image_id` integer;

ALTER TABLE "pages" ADD COLUMN `content_introduction_mobile_image_id` integer;

ALTER TABLE "pages" ADD COLUMN `content_introduction_cta_label` text;

ALTER TABLE "pages" ADD COLUMN `content_introduction_cta_path` text;

ALTER TABLE "pages" ADD COLUMN `content_capabilities_enabled` integer DEFAULT false;

ALTER TABLE "pages" ADD COLUMN `content_capabilities_eyebrow` text;

ALTER TABLE "pages" ADD COLUMN `content_capabilities_heading` text;

ALTER TABLE "pages" ADD COLUMN `content_innovations_enabled` integer DEFAULT false;

ALTER TABLE "pages" ADD COLUMN `content_innovations_eyebrow` text;

ALTER TABLE "pages" ADD COLUMN `content_innovations_heading` text;

ALTER TABLE "pages" ADD COLUMN `content_innovations_image_id` integer;

ALTER TABLE "pages" ADD COLUMN `content_innovations_mobile_image_id` integer;

ALTER TABLE "pages" ADD COLUMN `content_finder_enabled` integer DEFAULT false;

ALTER TABLE "pages" ADD COLUMN `content_finder_eyebrow` text;

ALTER TABLE "pages" ADD COLUMN `content_finder_heading` text;

ALTER TABLE "pages" ADD COLUMN `content_finder_body` text;

ALTER TABLE "pages" ADD COLUMN `content_finder_cta_label` text;

ALTER TABLE "pages" ADD COLUMN `content_finder_cta_path` text;

ALTER TABLE "pages" ADD COLUMN `content_faq_enabled` integer DEFAULT false;

ALTER TABLE "pages" ADD COLUMN `content_faq_eyebrow` text;

ALTER TABLE "pages" ADD COLUMN `content_faq_heading` text;

ALTER TABLE "pages" ADD COLUMN `content_contact_enabled` integer DEFAULT false;

ALTER TABLE "pages" ADD COLUMN `content_contact_eyebrow` text;

ALTER TABLE "pages" ADD COLUMN `content_contact_heading` text;

ALTER TABLE "pages" ADD COLUMN `content_contact_body` text;

ALTER TABLE "pages" ADD COLUMN `content_contact_image_id` integer;

ALTER TABLE "pages" ADD COLUMN `content_contact_mobile_image_id` integer;

ALTER TABLE "pages" ADD COLUMN `content_contact_cta_label` text;

ALTER TABLE "pages" ADD COLUMN `content_contact_cta_path` text;

ALTER TABLE "pages" ADD COLUMN `content_agriculture_enabled` integer DEFAULT false;

ALTER TABLE "pages" ADD COLUMN `content_agriculture_eyebrow` text;

ALTER TABLE "pages" ADD COLUMN `content_agriculture_heading` text;

ALTER TABLE "pages" ADD COLUMN `content_agriculture_image_id` integer;

ALTER TABLE "pages" ADD COLUMN `content_agriculture_mobile_image_id` integer;

ALTER TABLE "pages" ADD COLUMN `content_brand_story_enabled` integer DEFAULT false;

ALTER TABLE "pages" ADD COLUMN `content_brand_story_eyebrow` text;

ALTER TABLE "pages" ADD COLUMN `content_brand_story_heading` text;

ALTER TABLE "pages" ADD COLUMN `content_brand_story_image_id` integer;

ALTER TABLE "pages" ADD COLUMN `content_brand_story_mobile_image_id` integer;

ALTER TABLE "pages" ADD COLUMN `content_research_enabled` integer DEFAULT false;

ALTER TABLE "pages" ADD COLUMN `content_research_eyebrow` text;

ALTER TABLE "pages" ADD COLUMN `content_research_heading` text;

ALTER TABLE "pages" ADD COLUMN `content_global_presence_enabled` integer DEFAULT false;

ALTER TABLE "pages" ADD COLUMN `content_global_presence_heading` text;

ALTER TABLE "pages" ADD COLUMN `hero_mobile_image_id` integer;

ALTER TABLE "pages" ADD COLUMN `seo_social_image_id` integer;

ALTER TABLE "pages" ADD COLUMN `seo_canonical` text;

CREATE TABLE `_pages_v_version_content_introduction_bullets` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`id` integer PRIMARY KEY NOT NULL,
	`text` text,
	`_uuid` text,
	FOREIGN KEY (`_parent_id`) REFERENCES `_pages_v`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `_pages_v_version_content_capabilities_items` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`id` integer PRIMARY KEY NOT NULL,
	`heading` text,
	`body` text,
	`image_id` integer,
	`_uuid` text,
	FOREIGN KEY (`image_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`_parent_id`) REFERENCES `_pages_v`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `_pages_v_version_content_innovations_items` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`id` integer PRIMARY KEY NOT NULL,
	`heading` text,
	`body` text,
	`label` text,
	`product_id` integer,
	`_uuid` text,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`_parent_id`) REFERENCES `_pages_v`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `_pages_v_version_content_finder_items` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`id` integer PRIMARY KEY NOT NULL,
	`heading` text,
	`body` text,
	`category_id` integer,
	`_uuid` text,
	FOREIGN KEY (`category_id`) REFERENCES `product_functions`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`_parent_id`) REFERENCES `_pages_v`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `_pages_v_version_content_faq_items` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`id` integer PRIMARY KEY NOT NULL,
	`heading` text,
	`body` text,
	`_uuid` text,
	FOREIGN KEY (`_parent_id`) REFERENCES `_pages_v`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `_pages_v_version_content_agriculture_paragraphs` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`id` integer PRIMARY KEY NOT NULL,
	`text` text,
	`_uuid` text,
	FOREIGN KEY (`_parent_id`) REFERENCES `_pages_v`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `_pages_v_version_content_brand_story_paragraphs` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`id` integer PRIMARY KEY NOT NULL,
	`text` text,
	`_uuid` text,
	FOREIGN KEY (`_parent_id`) REFERENCES `_pages_v`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `_pages_v_version_content_research_images` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`id` integer PRIMARY KEY NOT NULL,
	`image_id` integer,
	`_uuid` text,
	FOREIGN KEY (`image_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`_parent_id`) REFERENCES `_pages_v`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `_pages_v_version_content_research_items` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`id` integer PRIMARY KEY NOT NULL,
	`heading` text,
	`body` text,
	`_uuid` text,
	FOREIGN KEY (`_parent_id`) REFERENCES `_pages_v`(`id`) ON UPDATE no action ON DELETE cascade
);

ALTER TABLE "_pages_v" ADD COLUMN `version_integration_version` numeric;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_introduction_enabled` integer DEFAULT false;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_introduction_eyebrow` text;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_introduction_heading` text;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_introduction_body` text;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_introduction_image_id` integer;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_introduction_mobile_image_id` integer;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_introduction_cta_label` text;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_introduction_cta_path` text;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_capabilities_enabled` integer DEFAULT false;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_capabilities_eyebrow` text;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_capabilities_heading` text;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_innovations_enabled` integer DEFAULT false;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_innovations_eyebrow` text;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_innovations_heading` text;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_innovations_image_id` integer;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_innovations_mobile_image_id` integer;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_finder_enabled` integer DEFAULT false;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_finder_eyebrow` text;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_finder_heading` text;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_finder_body` text;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_finder_cta_label` text;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_finder_cta_path` text;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_faq_enabled` integer DEFAULT false;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_faq_eyebrow` text;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_faq_heading` text;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_contact_enabled` integer DEFAULT false;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_contact_eyebrow` text;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_contact_heading` text;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_contact_body` text;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_contact_image_id` integer;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_contact_mobile_image_id` integer;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_contact_cta_label` text;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_contact_cta_path` text;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_agriculture_enabled` integer DEFAULT false;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_agriculture_eyebrow` text;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_agriculture_heading` text;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_agriculture_image_id` integer;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_agriculture_mobile_image_id` integer;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_brand_story_enabled` integer DEFAULT false;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_brand_story_eyebrow` text;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_brand_story_heading` text;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_brand_story_image_id` integer;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_brand_story_mobile_image_id` integer;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_research_enabled` integer DEFAULT false;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_research_eyebrow` text;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_research_heading` text;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_global_presence_enabled` integer DEFAULT false;

ALTER TABLE "_pages_v" ADD COLUMN `version_content_global_presence_heading` text;

ALTER TABLE "_pages_v" ADD COLUMN `version_hero_mobile_image_id` integer;

ALTER TABLE "_pages_v" ADD COLUMN `version_seo_social_image_id` integer;

ALTER TABLE "_pages_v" ADD COLUMN `version_seo_canonical` text;

ALTER TABLE "payload_locked_documents_rels" ADD COLUMN `site_presentation_id` integer;

ALTER TABLE "payload_locked_documents_rels" ADD COLUMN `product_redirects_id` integer;

CREATE INDEX `site_presentation_navigation_order_idx` ON `site_presentation_navigation` (`_order`);

CREATE INDEX `site_presentation_navigation_parent_id_idx` ON `site_presentation_navigation` (`_parent_id`);

CREATE INDEX `site_presentation_footer_quick_links_order_idx` ON `site_presentation_footer_quick_links` (`_order`);

CREATE INDEX `site_presentation_footer_quick_links_parent_id_idx` ON `site_presentation_footer_quick_links` (`_parent_id`);

CREATE INDEX `site_presentation_footer_product_links_order_idx` ON `site_presentation_footer_product_links` (`_order`);

CREATE INDEX `site_presentation_footer_product_links_parent_id_idx` ON `site_presentation_footer_product_links` (`_parent_id`);

CREATE INDEX `site_presentation_footer_legal_links_order_idx` ON `site_presentation_footer_legal_links` (`_order`);

CREATE INDEX `site_presentation_footer_legal_links_parent_id_idx` ON `site_presentation_footer_legal_links` (`_parent_id`);

CREATE INDEX `site_presentation_copy_order_idx` ON `site_presentation_copy` (`_order`);

CREATE INDEX `site_presentation_copy_parent_id_idx` ON `site_presentation_copy` (`_parent_id`);

CREATE INDEX `site_presentation_site_idx` ON `site_presentation` (`site_id`);

CREATE INDEX `site_presentation_footer_footer_logo_idx` ON `site_presentation` (`footer_logo_id`);

CREATE INDEX `site_presentation_updated_at_idx` ON `site_presentation` (`updated_at`);

CREATE INDEX `site_presentation_created_at_idx` ON `site_presentation` (`created_at`);

CREATE INDEX `site_presentation__status_idx` ON `site_presentation` (`_status`);

CREATE UNIQUE INDEX `site_idx` ON `site_presentation` (`site_id`);

CREATE INDEX `_site_presentation_v_version_navigation_order_idx` ON `_site_presentation_v_version_navigation` (`_order`);

CREATE INDEX `_site_presentation_v_version_navigation_parent_id_idx` ON `_site_presentation_v_version_navigation` (`_parent_id`);

CREATE INDEX `_site_presentation_v_version_footer_quick_links_order_idx` ON `_site_presentation_v_version_footer_quick_links` (`_order`);

CREATE INDEX `_site_presentation_v_version_footer_quick_links_parent_id_idx` ON `_site_presentation_v_version_footer_quick_links` (`_parent_id`);

CREATE INDEX `_site_presentation_v_version_footer_product_links_order_idx` ON `_site_presentation_v_version_footer_product_links` (`_order`);

CREATE INDEX `_site_presentation_v_version_footer_product_links_parent_id_idx` ON `_site_presentation_v_version_footer_product_links` (`_parent_id`);

CREATE INDEX `_site_presentation_v_version_footer_legal_links_order_idx` ON `_site_presentation_v_version_footer_legal_links` (`_order`);

CREATE INDEX `_site_presentation_v_version_footer_legal_links_parent_id_idx` ON `_site_presentation_v_version_footer_legal_links` (`_parent_id`);

CREATE INDEX `_site_presentation_v_version_copy_order_idx` ON `_site_presentation_v_version_copy` (`_order`);

CREATE INDEX `_site_presentation_v_version_copy_parent_id_idx` ON `_site_presentation_v_version_copy` (`_parent_id`);

CREATE INDEX `_site_presentation_v_parent_idx` ON `_site_presentation_v` (`parent_id`);

CREATE INDEX `_site_presentation_v_version_version_site_idx` ON `_site_presentation_v` (`version_site_id`);

CREATE INDEX `_site_presentation_v_version_footer_version_footer_logo_idx` ON `_site_presentation_v` (`version_footer_logo_id`);

CREATE INDEX `_site_presentation_v_version_version_updated_at_idx` ON `_site_presentation_v` (`version_updated_at`);

CREATE INDEX `_site_presentation_v_version_version_created_at_idx` ON `_site_presentation_v` (`version_created_at`);

CREATE INDEX `_site_presentation_v_version_version__status_idx` ON `_site_presentation_v` (`version__status`);

CREATE INDEX `_site_presentation_v_created_at_idx` ON `_site_presentation_v` (`created_at`);

CREATE INDEX `_site_presentation_v_updated_at_idx` ON `_site_presentation_v` (`updated_at`);

CREATE INDEX `_site_presentation_v_latest_idx` ON `_site_presentation_v` (`latest`);

CREATE INDEX `version_site_idx` ON `_site_presentation_v` (`version_site_id`);

CREATE INDEX `product_redirects_site_idx` ON `product_redirects` (`site_id`);

CREATE INDEX `product_redirects_product_idx` ON `product_redirects` (`product_id`);

CREATE INDEX `product_redirects_updated_at_idx` ON `product_redirects` (`updated_at`);

CREATE INDEX `product_redirects_created_at_idx` ON `product_redirects` (`created_at`);

CREATE UNIQUE INDEX `site_fromSlug_idx` ON `product_redirects` (`site_id`,`from_slug`);

CREATE INDEX `media_pdf_variant_idx` ON `media` (`pdf_variant_id`);

CREATE INDEX `products_seo_seo_social_image_idx` ON `products` (`seo_social_image_id`);

CREATE INDEX `_products_v_version_seo_version_seo_social_image_idx` ON `_products_v` (`version_seo_social_image_id`);

CREATE INDEX `pages_content_introduction_bullets_order_idx` ON `pages_content_introduction_bullets` (`_order`);

CREATE INDEX `pages_content_introduction_bullets_parent_id_idx` ON `pages_content_introduction_bullets` (`_parent_id`);

CREATE INDEX `pages_content_capabilities_items_order_idx` ON `pages_content_capabilities_items` (`_order`);

CREATE INDEX `pages_content_capabilities_items_parent_id_idx` ON `pages_content_capabilities_items` (`_parent_id`);

CREATE INDEX `pages_content_capabilities_items_image_idx` ON `pages_content_capabilities_items` (`image_id`);

CREATE INDEX `pages_content_innovations_items_order_idx` ON `pages_content_innovations_items` (`_order`);

CREATE INDEX `pages_content_innovations_items_parent_id_idx` ON `pages_content_innovations_items` (`_parent_id`);

CREATE INDEX `pages_content_innovations_items_product_idx` ON `pages_content_innovations_items` (`product_id`);

CREATE INDEX `pages_content_finder_items_order_idx` ON `pages_content_finder_items` (`_order`);

CREATE INDEX `pages_content_finder_items_parent_id_idx` ON `pages_content_finder_items` (`_parent_id`);

CREATE INDEX `pages_content_finder_items_category_idx` ON `pages_content_finder_items` (`category_id`);

CREATE INDEX `pages_content_faq_items_order_idx` ON `pages_content_faq_items` (`_order`);

CREATE INDEX `pages_content_faq_items_parent_id_idx` ON `pages_content_faq_items` (`_parent_id`);

CREATE INDEX `pages_content_agriculture_paragraphs_order_idx` ON `pages_content_agriculture_paragraphs` (`_order`);

CREATE INDEX `pages_content_agriculture_paragraphs_parent_id_idx` ON `pages_content_agriculture_paragraphs` (`_parent_id`);

CREATE INDEX `pages_content_brand_story_paragraphs_order_idx` ON `pages_content_brand_story_paragraphs` (`_order`);

CREATE INDEX `pages_content_brand_story_paragraphs_parent_id_idx` ON `pages_content_brand_story_paragraphs` (`_parent_id`);

CREATE INDEX `pages_content_research_images_order_idx` ON `pages_content_research_images` (`_order`);

CREATE INDEX `pages_content_research_images_parent_id_idx` ON `pages_content_research_images` (`_parent_id`);

CREATE INDEX `pages_content_research_images_image_idx` ON `pages_content_research_images` (`image_id`);

CREATE INDEX `pages_content_research_items_order_idx` ON `pages_content_research_items` (`_order`);

CREATE INDEX `pages_content_research_items_parent_id_idx` ON `pages_content_research_items` (`_parent_id`);

CREATE INDEX `pages_content_introduction_content_introduction_image_idx` ON `pages` (`content_introduction_image_id`);

CREATE INDEX `pages_content_introduction_content_introduction_mobile_i_idx` ON `pages` (`content_introduction_mobile_image_id`);

CREATE INDEX `pages_content_innovations_content_innovations_image_idx` ON `pages` (`content_innovations_image_id`);

CREATE INDEX `pages_content_innovations_content_innovations_mobile_ima_idx` ON `pages` (`content_innovations_mobile_image_id`);

CREATE INDEX `pages_content_contact_content_contact_image_idx` ON `pages` (`content_contact_image_id`);

CREATE INDEX `pages_content_contact_content_contact_mobile_image_idx` ON `pages` (`content_contact_mobile_image_id`);

CREATE INDEX `pages_content_agriculture_content_agriculture_image_idx` ON `pages` (`content_agriculture_image_id`);

CREATE INDEX `pages_content_agriculture_content_agriculture_mobile_ima_idx` ON `pages` (`content_agriculture_mobile_image_id`);

CREATE INDEX `pages_content_brand_story_content_brand_story_image_idx` ON `pages` (`content_brand_story_image_id`);

CREATE INDEX `pages_content_brand_story_content_brand_story_mobile_ima_idx` ON `pages` (`content_brand_story_mobile_image_id`);

CREATE INDEX `pages_hero_hero_mobile_image_idx` ON `pages` (`hero_mobile_image_id`);

CREATE INDEX `pages_seo_seo_social_image_idx` ON `pages` (`seo_social_image_id`);

CREATE INDEX `_pages_v_version_content_introduction_bullets_order_idx` ON `_pages_v_version_content_introduction_bullets` (`_order`);

CREATE INDEX `_pages_v_version_content_introduction_bullets_parent_id_idx` ON `_pages_v_version_content_introduction_bullets` (`_parent_id`);

CREATE INDEX `_pages_v_version_content_capabilities_items_order_idx` ON `_pages_v_version_content_capabilities_items` (`_order`);

CREATE INDEX `_pages_v_version_content_capabilities_items_parent_id_idx` ON `_pages_v_version_content_capabilities_items` (`_parent_id`);

CREATE INDEX `_pages_v_version_content_capabilities_items_image_idx` ON `_pages_v_version_content_capabilities_items` (`image_id`);

CREATE INDEX `_pages_v_version_content_innovations_items_order_idx` ON `_pages_v_version_content_innovations_items` (`_order`);

CREATE INDEX `_pages_v_version_content_innovations_items_parent_id_idx` ON `_pages_v_version_content_innovations_items` (`_parent_id`);

CREATE INDEX `_pages_v_version_content_innovations_items_product_idx` ON `_pages_v_version_content_innovations_items` (`product_id`);

CREATE INDEX `_pages_v_version_content_finder_items_order_idx` ON `_pages_v_version_content_finder_items` (`_order`);

CREATE INDEX `_pages_v_version_content_finder_items_parent_id_idx` ON `_pages_v_version_content_finder_items` (`_parent_id`);

CREATE INDEX `_pages_v_version_content_finder_items_category_idx` ON `_pages_v_version_content_finder_items` (`category_id`);

CREATE INDEX `_pages_v_version_content_faq_items_order_idx` ON `_pages_v_version_content_faq_items` (`_order`);

CREATE INDEX `_pages_v_version_content_faq_items_parent_id_idx` ON `_pages_v_version_content_faq_items` (`_parent_id`);

CREATE INDEX `_pages_v_version_content_agriculture_paragraphs_order_idx` ON `_pages_v_version_content_agriculture_paragraphs` (`_order`);

CREATE INDEX `_pages_v_version_content_agriculture_paragraphs_parent_id_idx` ON `_pages_v_version_content_agriculture_paragraphs` (`_parent_id`);

CREATE INDEX `_pages_v_version_content_brand_story_paragraphs_order_idx` ON `_pages_v_version_content_brand_story_paragraphs` (`_order`);

CREATE INDEX `_pages_v_version_content_brand_story_paragraphs_parent_id_idx` ON `_pages_v_version_content_brand_story_paragraphs` (`_parent_id`);

CREATE INDEX `_pages_v_version_content_research_images_order_idx` ON `_pages_v_version_content_research_images` (`_order`);

CREATE INDEX `_pages_v_version_content_research_images_parent_id_idx` ON `_pages_v_version_content_research_images` (`_parent_id`);

CREATE INDEX `_pages_v_version_content_research_images_image_idx` ON `_pages_v_version_content_research_images` (`image_id`);

CREATE INDEX `_pages_v_version_content_research_items_order_idx` ON `_pages_v_version_content_research_items` (`_order`);

CREATE INDEX `_pages_v_version_content_research_items_parent_id_idx` ON `_pages_v_version_content_research_items` (`_parent_id`);

CREATE INDEX `_pages_v_version_content_introduction_version_content_in_idx` ON `_pages_v` (`version_content_introduction_image_id`);

CREATE INDEX `_pages_v_version_content_introduction_version_content__1_idx` ON `_pages_v` (`version_content_introduction_mobile_image_id`);

CREATE INDEX `_pages_v_version_content_innovations_version_content_inn_idx` ON `_pages_v` (`version_content_innovations_image_id`);

CREATE INDEX `_pages_v_version_content_innovations_version_content_i_1_idx` ON `_pages_v` (`version_content_innovations_mobile_image_id`);

CREATE INDEX `_pages_v_version_content_contact_version_content_contact_idx` ON `_pages_v` (`version_content_contact_image_id`);

CREATE INDEX `_pages_v_version_content_contact_version_content_conta_1_idx` ON `_pages_v` (`version_content_contact_mobile_image_id`);

CREATE INDEX `_pages_v_version_content_agriculture_version_content_agr_idx` ON `_pages_v` (`version_content_agriculture_image_id`);

CREATE INDEX `_pages_v_version_content_agriculture_version_content_a_1_idx` ON `_pages_v` (`version_content_agriculture_mobile_image_id`);

CREATE INDEX `_pages_v_version_content_brand_story_version_content_bra_idx` ON `_pages_v` (`version_content_brand_story_image_id`);

CREATE INDEX `_pages_v_version_content_brand_story_version_content_b_1_idx` ON `_pages_v` (`version_content_brand_story_mobile_image_id`);

CREATE INDEX `_pages_v_version_hero_version_hero_mobile_image_idx` ON `_pages_v` (`version_hero_mobile_image_id`);

CREATE INDEX `_pages_v_version_seo_version_seo_social_image_idx` ON `_pages_v` (`version_seo_social_image_id`);

CREATE INDEX `payload_locked_documents_rels_site_presentation_id_idx` ON `payload_locked_documents_rels` (`site_presentation_id`);

CREATE INDEX `payload_locked_documents_rels_product_redirects_id_idx` ON `payload_locked_documents_rels` (`product_redirects_id`);
