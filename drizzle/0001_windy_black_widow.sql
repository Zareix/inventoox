PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_category` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(256) NOT NULL,
	`icon` text(256) NOT NULL,
	`parent_category_id` integer
);
--> statement-breakpoint
INSERT INTO `__new_category`("id", "name", "icon", "parent_category_id") SELECT "id", "name", "icon", "parent_category_id" FROM `category`;--> statement-breakpoint
DROP TABLE `category`;--> statement-breakpoint
ALTER TABLE `__new_category` RENAME TO `category`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `category_name_idx` ON `category` (`name`);