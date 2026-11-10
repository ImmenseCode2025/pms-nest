-- =====================================================================
-- Tables: parking_price, parking_price_logs
-- =====================================================================

-- 2026-11-10: Drop unused pricing columns
--   - defaultHour
--   - additionalCharges
--   - additionalChargesType
--   - additionalChargesCategoryCount
--
-- Note: parking_price_logs mirrors parking_price, so the same columns are
-- dropped from both tables. Data in these columns is lost permanently;
-- take a backup first if it may be needed later.

ALTER TABLE `parking_price`
  DROP COLUMN `defaultHour`,
  DROP COLUMN `additionalCharges`,
  DROP COLUMN `additionalChargesType`,
  DROP COLUMN `additionalChargesCategoryCount`;


-- 2026-11-10: Add createdAt (saved by the parking site register API)
ALTER TABLE `parking_price`
  ADD COLUMN `createdAt` DATETIME NULL DEFAULT CURRENT_TIMESTAMP;
