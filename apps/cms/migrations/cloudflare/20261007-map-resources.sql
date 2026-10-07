ALTER TABLE `media` ADD COLUMN `focal_x` numeric;
ALTER TABLE `media` ADD COLUMN `focal_y` numeric;
CREATE TABLE `map_locations` (
	`id` integer PRIMARY KEY NOT NULL,
	`site_id` integer,
	`key` text,
	`label` text,
	`country` text,
	`region` text,
	`latitude` numeric,
	`longitude` numeric,
	`description` text,
	`url` text,
	`display_order` numeric DEFAULT 0,
	`enabled` integer DEFAULT true,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`_status` text DEFAULT 'draft',
	FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON UPDATE no action ON DELETE set null
);
CREATE TABLE `_map_locations_v` (
	`id` integer PRIMARY KEY NOT NULL,
	`parent_id` integer,
	`version_site_id` integer,
	`version_key` text,
	`version_label` text,
	`version_country` text,
	`version_region` text,
	`version_latitude` numeric,
	`version_longitude` numeric,
	`version_description` text,
	`version_url` text,
	`version_display_order` numeric DEFAULT 0,
	`version_enabled` integer DEFAULT true,
	`version_updated_at` text,
	`version_created_at` text,
	`version__status` text DEFAULT 'draft',
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`latest` integer,
	FOREIGN KEY (`parent_id`) REFERENCES `map_locations`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`version_site_id`) REFERENCES `sites`(`id`) ON UPDATE no action ON DELETE set null
);
ALTER TABLE `payload_locked_documents_rels` ADD COLUMN `map_locations_id` integer;
CREATE INDEX `map_locations_site_idx` ON `map_locations` (`site_id`);
CREATE UNIQUE INDEX `map_locations_key_idx` ON `map_locations` (`key`);
CREATE INDEX `map_locations_updated_at_idx` ON `map_locations` (`updated_at`);
CREATE INDEX `map_locations_created_at_idx` ON `map_locations` (`created_at`);
CREATE INDEX `map_locations__status_idx` ON `map_locations` (`_status`);
CREATE INDEX `_map_locations_v_parent_idx` ON `_map_locations_v` (`parent_id`);
CREATE INDEX `_map_locations_v_version_version_site_idx` ON `_map_locations_v` (`version_site_id`);
CREATE INDEX `_map_locations_v_version_version_key_idx` ON `_map_locations_v` (`version_key`);
CREATE INDEX `_map_locations_v_version_version_updated_at_idx` ON `_map_locations_v` (`version_updated_at`);
CREATE INDEX `_map_locations_v_version_version_created_at_idx` ON `_map_locations_v` (`version_created_at`);
CREATE INDEX `_map_locations_v_version_version__status_idx` ON `_map_locations_v` (`version__status`);
CREATE INDEX `_map_locations_v_created_at_idx` ON `_map_locations_v` (`created_at`);
CREATE INDEX `_map_locations_v_updated_at_idx` ON `_map_locations_v` (`updated_at`);
CREATE INDEX `_map_locations_v_latest_idx` ON `_map_locations_v` (`latest`);
CREATE INDEX `payload_locked_documents_rels_map_locations_id_idx` ON `payload_locked_documents_rels` (`map_locations_id`);
