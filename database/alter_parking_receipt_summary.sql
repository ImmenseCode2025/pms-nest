-- Alter table parking_receipt_summary to add vehicle-wise FOC ticket counts and siteId
ALTER TABLE `parking_receipt_summary`
  ADD COLUMN `focCarTickets` INT NOT NULL DEFAULT 0 AFTER `focTickets`,
  ADD COLUMN `focVanTickets` INT NOT NULL DEFAULT 0 AFTER `focCarTickets`,
  ADD COLUMN `focBusTickets` INT NOT NULL DEFAULT 0 AFTER `focVanTickets`,
  ADD COLUMN `focBikeTickets` INT NOT NULL DEFAULT 0 AFTER `focBusTickets`,
  ADD COLUMN `siteId` INT NOT NULL DEFAULT 0 AFTER `generationDateTime`,
  ADD COLUMN `handheldId` INT NOT NULL DEFAULT 0 AFTER `siteId`;

