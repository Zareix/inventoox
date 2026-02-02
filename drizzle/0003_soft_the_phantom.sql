ALTER TABLE `category` ADD `createdAt` integer DEFAULT (unixepoch()) NOT NULL;--> statement-breakpoint
ALTER TABLE `category` ADD `updated_at` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `item` ADD `createdAt` integer DEFAULT (unixepoch()) NOT NULL;--> statement-breakpoint
ALTER TABLE `item` ADD `updated_at` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `location` ADD `createdAt` integer DEFAULT (unixepoch()) NOT NULL;--> statement-breakpoint
ALTER TABLE `location` ADD `updated_at` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `room` ADD `createdAt` integer DEFAULT (unixepoch()) NOT NULL;--> statement-breakpoint
ALTER TABLE `room` ADD `updated_at` integer NOT NULL;