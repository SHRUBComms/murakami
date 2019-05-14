CREATE TABLE `access_tokens` (
  `token` varchar(25) NOT NULL,
  `timestamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `details` text NOT NULL,
  `used` int(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `activity` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(11) NOT NULL,
  `action` text NOT NULL,
  `details` json NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `carbon` (
  `transaction_id` varchar(30) NOT NULL,
  `group_id` varchar(12) NOT NULL,
  `user_id` varchar(25) NOT NULL,
  `member_id` varchar(11) NOT NULL,
  `trans_object` json NOT NULL,
  `method` varchar(20) NOT NULL DEFAULT 'recycled',
  `trans_date` datetime NOT NULL,
  PRIMARY KEY (`transaction_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `carbon_categories` (
  `carbon_id` varchar(6) NOT NULL,
  `name` varchar(50) NOT NULL,
  `factors` json NOT NULL,
  `active` int(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (`carbon_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `data_permissions` (
  `class` varchar(15) NOT NULL,
  `permissions` json NOT NULL,
  PRIMARY KEY (`class`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `food_collections` (
  `transaction_id` varchar(15) NOT NULL,
  `member_id` varchar(11) NOT NULL,
  `organisation_id` varchar(15) NOT NULL,
  `timestamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `amount` varchar(5) NOT NULL,
  `note` text,
  `approved` int(4) DEFAULT NULL,
  PRIMARY KEY (`transaction_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `food_collections_organisations` (
  `organisation_id` varchar(15) NOT NULL,
  `name` varchar(50) NOT NULL,
  `dateCreated` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `active` int(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (`organisation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `mail_templates` (
  `active` int(4) NOT NULL DEFAULT '1',
  `mail_id` varchar(50) NOT NULL,
  `mail_desc` text NOT NULL,
  `subject` text,
  `markup` text NOT NULL,
  `plaintext` text NOT NULL,
  PRIMARY KEY (`mail_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `members` (
  `member_id` varchar(11) NOT NULL,
  `barcode` varchar(15) DEFAULT NULL,
  `first_name` varchar(20) NOT NULL,
  `last_name` varchar(30) NOT NULL,
  `email` varchar(89) NOT NULL,
  `phone_no` varchar(15) DEFAULT NULL,
  `address` text,
  `is_member` int(1) NOT NULL,
  `free` int(1) NOT NULL,
  `working_groups` json DEFAULT NULL,
  `contactPreferences` json DEFAULT NULL,
  `balance` int(10) NOT NULL,
  `earliest_membership_date` date NOT NULL,
  `current_init_membership` date NOT NULL,
  `current_exp_membership` date NOT NULL,
  PRIMARY KEY (`member_id`),
  UNIQUE KEY `barcode` (`barcode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `password_reset` (
  `user_id` varchar(50) NOT NULL,
  `ip_address` varchar(39) NOT NULL,
  `reset_code` varchar(25) NOT NULL,
  `date_issued` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `used` int(1) NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`reset_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `subject` varchar(20) NOT NULL,
  `date` date NOT NULL,
  `report` json NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `settings` (
  `id` varchar(50) NOT NULL,
  `data` json NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `stock_categories` (
  `item_id` varchar(25) NOT NULL,
  `till_id` varchar(25) DEFAULT NULL,
  `carbon_id` varchar(6) DEFAULT NULL,
  `name` varchar(50) NOT NULL,
  `value` float DEFAULT NULL,
  `weight` int(11) DEFAULT NULL,
  `needsCondition` int(4) NOT NULL DEFAULT '0',
  `quantity` int(11) DEFAULT NULL,
  `allowTokens` int(4) NOT NULL DEFAULT '1',
  `member_discount` int(3) NOT NULL DEFAULT '0',
  `action` varchar(20) DEFAULT NULL,
  `parent` varchar(10) DEFAULT NULL,
  `active` int(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `till_activity` (
  `action_id` varchar(25) NOT NULL,
  `till_id` varchar(25) NOT NULL,
  `user_id` varchar(11) NOT NULL,
  `timestamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expected_float` float DEFAULT NULL,
  `counted_float` float NOT NULL,
  `note` text,
  `opening` int(4) NOT NULL,
  PRIMARY KEY (`action_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `tills` (
  `till_id` varchar(25) NOT NULL,
  `group_id` varchar(10) NOT NULL,
  `name` varchar(50) NOT NULL,
  `stockControl` int(4) NOT NULL,
  PRIMARY KEY (`till_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `transactions` (
  `transaction_id` varchar(30) NOT NULL,
  `till_id` varchar(25) DEFAULT NULL,
  `user_id` varchar(25) NOT NULL,
  `member_id` varchar(15) DEFAULT NULL,
  `date` datetime NOT NULL,
  `summary` json NOT NULL,
  PRIMARY KEY (`transaction_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `users` (
  `id` varchar(11) NOT NULL,
  `username` varchar(20) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `class` varchar(25) NOT NULL,
  `working_groups` json DEFAULT NULL,
  `notification_preferences` json DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deactivated` int(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `volunteer_checkins` (
  `checkin_id` varchar(25) NOT NULL,
  `member_id` varchar(11) NOT NULL,
  `user_id` varchar(11) NOT NULL,
  `questionnaire` json NOT NULL,
  `timestamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`checkin_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `volunteer_hours` (
  `shift_id` varchar(11) NOT NULL,
  `member_id` varchar(11) NOT NULL,
  `date` date NOT NULL,
  `duration_as_decimal` float NOT NULL,
  `working_group` varchar(10) NOT NULL,
  `note` text,
  `approved` int(1) DEFAULT NULL,
  PRIMARY KEY (`shift_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `volunteer_info` (
  `member_id` varchar(11) NOT NULL,
  `emergencyContactRelation` varchar(25) NOT NULL,
  `emergencyContactName` varchar(25) NOT NULL,
  `emergencyContactPhoneNo` varchar(15) NOT NULL,
  `roles` json NOT NULL,
  `assignedCoordinators` json NOT NULL,
  `survey` json NOT NULL,
  `availability` json NOT NULL,
  `gdpr` json NOT NULL,
  `dateCreated` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastUpdated` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`member_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `volunteer_roles` (
  `role_id` varchar(20) NOT NULL,
  `group_id` varchar(12) DEFAULT NULL,
  `details` json NOT NULL,
  `availability` json DEFAULT NULL,
  `dateCreated` datetime DEFAULT NULL,
  `public` int(4) NOT NULL DEFAULT '0',
  `removed` int(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `working_groups` (
  `group_id` varchar(12) NOT NULL,
  `prefix` varchar(10) DEFAULT NULL,
  `name` varchar(50) NOT NULL,
  `welcomeMessage` text,
  `parent` varchar(12) DEFAULT NULL,
  PRIMARY KEY (`group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
