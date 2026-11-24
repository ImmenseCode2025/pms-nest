-- =====================================================================
-- Drop unused tables
-- =====================================================================

-- 2026-11-10: Drop tables that are no longer used.
--
-- Note: foreign key checks are switched off so the tables can be dropped
-- in any order. Data in these tables is lost permanently; take a backup
-- first if it may be needed later.

SET FOREIGN_KEY_CHECKS = 0;

-- Payments
DROP TABLE IF EXISTS `easypaisa`;
DROP TABLE IF EXISTS `jazzcash`;

-- Entrance / exit
DROP TABLE IF EXISTS `entrance_exit_monitor`;

-- E-tag
DROP TABLE IF EXISTS `etag`;
DROP TABLE IF EXISTS `etag_logs`;

-- Handheld
DROP TABLE IF EXISTS `handheld`;
DROP TABLE IF EXISTS `handheld_data`;

-- Free parking
DROP TABLE IF EXISTS `free_parking_vehicles`;

-- Chat
DROP TABLE IF EXISTS `messages`;
DROP TABLE IF EXISTS `room_members`;
DROP TABLE IF EXISTS `rooms`;
DROP TABLE IF EXISTS `customer_support_chat`;
DROP TABLE IF EXISTS `customer_support_room`;

-- Reservation
DROP TABLE IF EXISTS `reservation`;

-- Scratch card
DROP TABLE IF EXISTS `scratch_card`;
DROP TABLE IF EXISTS `scratch_card_reconciled`;

-- Discounts
DROP TABLE IF EXISTS `discount`;
DROP TABLE IF EXISTS `discount_and_offer`;

-- Parking structure
DROP TABLE IF EXISTS `parking_block`;
DROP TABLE IF EXISTS `parking_block_floor`;
DROP TABLE IF EXISTS `parking_gate`;
DROP TABLE IF EXISTS `parking_lot`;

-- Parking card
DROP TABLE IF EXISTS `parking_card`;
DROP TABLE IF EXISTS `reactivate_parking_card`;

-- Parking price
DROP TABLE IF EXISTS `parking_price_logs`;
DROP TABLE IF EXISTS `bank_card`;

SET FOREIGN_KEY_CHECKS = 1;
