-- Additive editorial integration schema. Review and apply once after backup.

ALTER TABLE "pages" ADD COLUMN `hero_tablet_image_id` integer;

ALTER TABLE "_pages_v" ADD COLUMN `version_hero_tablet_image_id` integer;

CREATE INDEX `pages_hero_hero_tablet_image_idx` ON `pages` (`hero_tablet_image_id`);

CREATE INDEX `_pages_v_version_hero_version_hero_tablet_image_idx` ON `_pages_v` (`version_hero_tablet_image_id`);
