CREATE TABLE `item` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(256) NOT NULL,
	`category_id` integer NOT NULL,
	`location_id` integer NOT NULL,
	`value` integer NOT NULL,
	`size` text(128) NOT NULL,
	`owner_id` text,
	`quantity` integer NOT NULL,
	`brand` text(256) NOT NULL,
	`state` text(128) NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`location_id`) REFERENCES `location`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `item_name_idx` ON `item` (`name`);