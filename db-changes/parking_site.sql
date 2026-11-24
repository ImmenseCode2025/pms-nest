-- =====================================================================
-- Table: parking_site
-- =====================================================================

-- 2026-11-10: Parking site register (name, area, location, lat/lng, pricing)
--   - Add: location (TEXT), latitude, longitude, createdAt
--   - Drop unused columns: unitOfMeasure, isValetParkingAvailable,
--     collectionPoint, creationDateTime
--
-- Note: creationDateTime is copied into createdAt before it is dropped.

ALTER TABLE `parking_site`
  ADD COLUMN `location`  TEXT        NULL DEFAULT NULL AFTER `area`,
  ADD COLUMN `latitude`  VARCHAR(50) NULL DEFAULT NULL AFTER `location`,
  ADD COLUMN `longitude` VARCHAR(50) NULL DEFAULT NULL AFTER `latitude`,
  ADD COLUMN `createdAt` DATETIME    NULL DEFAULT CURRENT_TIMESTAMP AFTER `company`;

-- location already exists as VARCHAR(255) from the earlier run -> make it TEXT
ALTER TABLE `parking_site` MODIFY COLUMN `location` TEXT NULL DEFAULT NULL;

UPDATE `parking_site` SET `createdAt` = `creationDateTime`;

ALTER TABLE `parking_site`
  DROP COLUMN `unitOfMeasure`,
  DROP COLUMN `isValetParkingAvailable`,
  DROP COLUMN `collectionPoint`,
  DROP COLUMN `creationDateTime`;

-- 2026-11-10: Drop address (site location is now stored in location/lat/lng)
-- If `address` has a foreign key, drop it first. Find its name with:
--   SHOW CREATE TABLE `parking_site`;
-- then run:
--   ALTER TABLE `parking_site` DROP FOREIGN KEY `<constraint_name>`;
ALTER TABLE `parking_site`
  DROP COLUMN `address`;
