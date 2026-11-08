-- ChopWise MySQL Database Schema (for XAMPP / MariaDB / MySQL)

CREATE DATABASE IF NOT EXISTS `chopwise`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `chopwise`;

-- 1. USERS & PROFILES TABLE
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `consent_at` DATETIME NULL,
  `profile_complete` TINYINT(1) NOT NULL DEFAULT 0,
  `profile` LONGTEXT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. SAVED MEALS TABLE
CREATE TABLE IF NOT EXISTS `saved_meals` (
  `id` VARCHAR(100) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `meal_id` VARCHAR(100) NOT NULL,
  `meal` LONGTEXT NOT NULL,
  `saved_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_meal` (`user_id`, `meal_id`),
  KEY `idx_saved_meals_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. LATEST RECOMMENDATIONS CACHE
CREATE TABLE IF NOT EXISTS `latest_recs` (
  `user_id` VARCHAR(36) NOT NULL,
  `meals` LONGTEXT NOT NULL,
  `profile_hash` VARCHAR(64) NULL,
  `per_meal_cap_ngn` DECIMAL(10,2) NULL,
  `generated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. INGREDIENT NUTRITION CACHE
CREATE TABLE IF NOT EXISTS `nutrition_cache` (
  `ingredients_hash` VARCHAR(64) NOT NULL,
  `nutrition` LONGTEXT NOT NULL,
  `source` VARCHAR(50) NOT NULL,
  `fetched_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ingredients_hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. RATE LIMITS TABLE
CREATE TABLE IF NOT EXISTS `rate_limits` (
  `user_id` VARCHAR(64) NOT NULL,
  `window_start` BIGINT NOT NULL,
  `count` INT NOT NULL DEFAULT 1,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. ADMIN CONFIG & ENCRYPTED CREDENTIALS
CREATE TABLE IF NOT EXISTS `admin_config` (
  `section` VARCHAR(50) NOT NULL,
  `config` LONGTEXT NOT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`section`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

