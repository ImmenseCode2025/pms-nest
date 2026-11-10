-- =====================================================================
-- Table: user
-- =====================================================================

-- 2026-11-10: Store user location directly on the user (like parking_site)
--   - Add: location (TEXT), latitude, longitude

ALTER TABLE `user`
  ADD COLUMN `location`  TEXT        NULL DEFAULT NULL AFTER `address`,
  ADD COLUMN `latitude`  VARCHAR(50) NULL DEFAULT NULL AFTER `location`,
  ADD COLUMN `longitude` VARCHAR(50) NULL DEFAULT NULL AFTER `latitude`;
