-- =====================================================================
-- Table: vehicle_type
-- =====================================================================

-- 2026-11-10: Drop unused columns
--   - user
--   - userId
--   - registerDateTime
--
-- Note: if `user` has a foreign key to `user`.`id`, drop that constraint
-- first. Find its name with:
--   SHOW CREATE TABLE `vehicle_type`;
-- then run:
--   ALTER TABLE `vehicle_type` DROP FOREIGN KEY `<constraint_name>`;
-- Remove `userId` from the statement below if that column is not in the table.

ALTER TABLE `vehicle_type`
  DROP COLUMN `user`,
  DROP COLUMN `userId`,
  DROP COLUMN `registerDateTime`;
