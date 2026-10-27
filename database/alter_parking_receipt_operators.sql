-- Alter table parking_receipt to add check-in and check-out operator tracking columns
ALTER TABLE `parking_receipt`
  ADD COLUMN `checkInOperatorId` INT NULL DEFAULT 0,
  ADD COLUMN `checkOutOperatorId` INT NULL DEFAULT 0;
