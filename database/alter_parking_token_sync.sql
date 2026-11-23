-- Site servers (realpark) apne local `tokens` yahan push karte hain: POST /api/sync/tokens/push
-- Sab columns NULLABLE — purana code (bina in columns k insert) waisa hi chalta rahe.
--   syncUuid    : local token ki global pehchan (upsert key) — purani rows mein NULL (UNIQUE mein kai NULL allowed)
--   syncVersion : local `tokens.version` — sirf naya version purane ko overwrite karta hai
--   localId     : site server par token ka id (reference / debug)
-- MySQL 8: ADD COLUMN instant hai, UNIQUE KEY online banti hai (table lock nahi hota)
ALTER TABLE `parking_token`
  ADD COLUMN `syncUuid` CHAR(36) NULL DEFAULT NULL,
  ADD COLUMN `syncVersion` INT NULL DEFAULT NULL,
  ADD COLUMN `localId` BIGINT NULL DEFAULT NULL,
  ADD COLUMN `amount` DECIMAL(10, 2) NULL DEFAULT NULL,
  ADD COLUMN `checkInOperatorId` INT NULL DEFAULT NULL,
  ADD COLUMN `checkOutOperatorId` INT NULL DEFAULT NULL,
  ADD UNIQUE KEY `parking_token_sync_uuid_unique` (`syncUuid`);
