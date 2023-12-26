CREATE TABLE `district_data_bn` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`div_bn_id` integer NOT NULL,
	FOREIGN KEY (`div_bn_id`) REFERENCES `division_data_bn`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `district_data_en` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`div_en_id` integer NOT NULL,
	FOREIGN KEY (`div_en_id`) REFERENCES `division_data_en`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `division_data_bn` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `division_data_en` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sub_district_data_bn` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`div_bn_id` integer NOT NULL,
	`dist_bn_id` integer NOT NULL,
	FOREIGN KEY (`div_bn_id`) REFERENCES `division_data_bn`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`dist_bn_id`) REFERENCES `district_data_bn`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sub_district_data_en` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`div_en_id` integer NOT NULL,
	`dist_en_id` integer NOT NULL,
	FOREIGN KEY (`div_en_id`) REFERENCES `division_data_en`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`dist_en_id`) REFERENCES `district_data_en`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `union_data_bn` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`div_bn_id` integer NOT NULL,
	`dist_bn_id` integer NOT NULL,
	`sub_dist_bn_id` integer NOT NULL,
	FOREIGN KEY (`div_bn_id`) REFERENCES `division_data_bn`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`dist_bn_id`) REFERENCES `district_data_bn`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sub_dist_bn_id`) REFERENCES `sub_district_data_bn`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `union_data_en` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`div_en_id` integer NOT NULL,
	`dist_en_id` integer NOT NULL,
	`sub_dist_en_id` integer NOT NULL,
	FOREIGN KEY (`div_en_id`) REFERENCES `division_data_en`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`dist_en_id`) REFERENCES `district_data_en`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sub_dist_en_id`) REFERENCES `sub_district_data_en`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `dist_bn_id` ON `district_data_bn` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `dist_en_id` ON `district_data_en` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `div_bn_id` ON `division_data_bn` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `div_en_id` ON `division_data_en` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `sub_dist_bn_id` ON `sub_district_data_bn` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `sub_dist_en_id` ON `sub_district_data_en` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `union_bn_id` ON `union_data_bn` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `union_en_id` ON `union_data_en` (`id`);