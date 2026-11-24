-- =====================================================================
-- Table: hardware
-- =====================================================================

-- 2026-11-11: Drop assignedTo (hardware is now always assigned to a parking site;
-- `asignee` holds the parking_site id)
--
-- Note: rows whose assignedTo was not 'parking site' keep an `asignee` that is NOT a
-- parking_site id, so they will show the wrong site / no site after this change.
-- Check them before running and re-assign them to a site:
--   SELECT id, sku, ipOrApi, assignedTo, asignee FROM `hardware` WHERE assignedTo <> 'parking site';
--
-- Note: legacy pms-admin-web-backend (kmcParkingAdminWeb.py) still selects/filters
-- hardware.assignedTo; those queries will fail after this column is dropped.

ALTER TABLE `hardware`
  DROP COLUMN `assignedTo`;
