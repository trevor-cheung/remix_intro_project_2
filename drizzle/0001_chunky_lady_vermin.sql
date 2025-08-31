CREATE TABLE `tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`completed` integer DEFAULT 0 NOT NULL,
	`createdAt` text DEFAULT '2025-08-31T15:02:38.028Z' NOT NULL,
	`updatedAt` text DEFAULT '2025-08-31T15:02:38.029Z' NOT NULL
);
