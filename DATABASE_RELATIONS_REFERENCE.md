# PMS Database Tables & Relationship Reference Guide

This document maps all database models and relationships across the PMS system (from backend models / Sequelize / Objection ORM).
Use this reference during CRUD operations, especially **DELETE / CASCADE** operations, to ensure relational integrity without leaving orphan records.

---

## 1. Shift Closing Module (`parking_shift_closing`)

### Main Parent Table: `parking_shift_closing` (ID)

| Relationship Type | Related Table | Foreign Key Column | Description / Action on Delete |
| :--- | :--- | :--- | :--- |
| **Belongs To** | `parking_site` | `site` | Parking site where shift closed |
| **Belongs To** | `users` | `user` | Shift Operator / Cashier |
| **Belongs To** | `users` | `supervisor` | Shift Supervisor who approved/verified |
| **Belongs To** | `hardware` | `deviceId` | Device / Handheld unit used |
| **Has Many (Child)** | `shift_closing_collection` | `shiftClosing` | ⚠️ **Must Delete**: Breakdown per vehicle type & amount |
| **Has Many (Child)** | `shift_closing_payment_method` | `shiftClosing` | ⚠️ **Must Delete**: Breakdown per payment method |
| **Has Many (Child)** | `parking_shift_closing_history` | `shiftClosingId` | ⚠️ **Must Delete / Archive**: History / Audit logs & signatures |

---

## 2. Parking Tokens & Receipts (`parking_token`, `parking_receipt`)

### Parent Table: `parking_token` (ID)

| Relationship Type | Related Table | Foreign Key Column | Notes |
| :--- | :--- | :--- | :--- |
| **Belongs To** | `parking_site` | `site` | Site location |
| **Belongs To** | `hardware` | `deviceId` | Entry/Exit device |
| **Belongs To** | `parking_lot` | `parkingLot` | Assigned slot |
| **Belongs To** | `vehicle_type` | `vehicleType` | Car, Bike, etc. |
| **Belongs To** | `payment_method` | `paymentMethod` | Cash, Card, FOC, etc. |
| **Has Many** | `payment` | `parkingToken` | Payment transactions |
| **Has Many** | `reservation` | `parkingToken` | Slot reservations |
| **Has Many** | `entrance_exit_monitor` | `parkingToken` | Entry/Exit barrier event logs |
| **Has One** | `parking_token_reconciled` | `parkingToken` | Reconciliation record |

### Parent Table: `parking_receipt` (ID)

| Relationship Type | Related Table | Foreign Key Column | Notes |
| :--- | :--- | :--- | :--- |
| **Belongs To** | `hardware` | `deviceId` (IP/API) | Handheld POS device |
| **Belongs To** | `vehicle_type` | `vehicleType` | Vehicle category |
| **Belongs To** | `payment_method` | `paymentMethod` | Payment mode |
| **Has Many** | `parking_receipt_backlog` | `receiptId` | Offline sync backlogs |
| **Has Many** | `parking_receipt_offline_log` | `receiptId` | Offline transaction logs |

---

## 3. Corporate & Invoicing Module (`corporate`)

### Parent Table: `corporate` (ID)

| Relationship Type | Related Table | Foreign Key Column | Description |
| :--- | :--- | :--- | :--- |
| **Belongs To** | `address` | `address` | Corporate head office address |
| **Has Many** | `corporate_cards` | `corporate` | Cards issued to corporate employees |
| **Has Many** | `corporate_billing_plan` | `corporate` | Active & historical billing plans |
| **Has Many** | `corporate_invoice` | `corporate` | Invoices generated for corporate |
| **Has Many** | `corporate_reset_password` | `corporate` | Password reset tokens |
| **Has Many** | `portal_notification` | `corporate` | In-app alerts/notifications |

### Child Table: `corporate_cards` (ID)
* Belongs To `corporate` (`corporate`)
* Belongs To `vehicle_type` (`vehicleType`)
* Belongs To `customer` (`customer`)
* Has Many `corporate_qr_code` (`corporateCardId`)

### Child Table: `corporate_invoice` (ID)
* Belongs To `corporate` (`corporate`)
* Belongs To `corporate_billing_plan` (`billingPlanId`)
* Has Many `corporate_invoice_payment` (`invoiceId`)
* Has Many `corporate_invoice_log` (`invoiceId`)

---

## 4. Hardware & Devices (`hardware`)

### Parent Table: `hardware` (ID)

| Relationship Type | Related Table | Foreign Key Column | Description |
| :--- | :--- | :--- | :--- |
| **Belongs To** | `parking_site` | `asignee` | Assigned parking site |
| **Has Many** | `hardware_assign_logs` | `hardwareId` | Reallocation and movement logs |
| **Has Many** | `parking_shift_closing` | `deviceId` | Shift closings performed on device |
| **Has Many** | `app_qr_code` | `deviceId` | QR scanning events |
| **Has Many** | `company_qr_code` | `deviceId` | Company QR scans |
| **Has Many** | `foc_qr_code` | `deviceId` | FOC QR scans |
| **Has Many** | `cash_qr_code` | `deviceId` | Cash QR scans |
| **Has Many** | `pos_qr_code` | `deviceId` | POS QR scans |
| **Has Many** | `entrance_exit_monitor`| `deviceId` | Gate monitor events |

---

## 5. Customers & Accounts (`customer`, `users`)

### Parent Table: `customer` (ID)
* Has Many `customer_access_token` (`customerId`)
* Has Many `customer_reset_password` (`customerId`)
* Has Many `bank_card` (`customer`)
* Has Many `parking_card` (`customer`)
* Has Many `etag` (`customer`)
* Has Many `reservation` (`customer`)
* Has Many `payment` (`customer`)
* Has Many `notifications` (`customerId`)
* Has Many `app_qr_code` (`customer`)

### Parent Table: `users` (ID)
* Has Many `user_access_token` (`userId`)
* Has Many `parking_shift_closing` (`user` / `supervisor`)
* Has Many `parking_price_logs` (`userId`)
* Has Many `hardware_assign_logs` (`assignedBy` / `assignedTo`)
* Has Many `pos_qr_code` (`user`)
* Has Many `scratch_cards` (`created_by`)
* Has Many `portal_notification` (`userId` / `senderId`)

---

## 6. Parking Site & Infrastructure (`parking_site`)

### Parent Table: `parking_site` (ID)
* Belongs To `company` (`company`)
* Belongs To `address` (`address`)
* Has Many `parking_block` (`parkingSite`)
* Has Many `parking_price` (`siteId`)
* Has Many `parking_price_logs` (`siteId`)
* Has Many `hardware` (`asignee`)
* Has Many `parking_token` (`site`)
* Has Many `parking_shift_closing` (`site`)
* Has Many `etag` (`site`)
* Has Many `etag_logs` (`site`)
* Has Many `company_cards` (`parkingSite`)
* Has Many `company_qr_code`, `foc_qr_code`, `cash_qr_code`, `pos_qr_code`, `app_qr_code` (`site`)

---

## 7. Scratch Cards & E-Tag Modules

### `scratch_card` / `scratch_cards`
* `scratch_card` -> Has One `parking_token_reconciled` (`scratchCardId`)
* `scratch_card` -> Has One `scratch_cards` (`scratchCardId`)
* `scratch_cards` -> Has Many `scratch_cards_history` (`scratchCardId`)

### `etag` / `etag_logs`
* `etag` -> Belongs To `users`, `vehicle_type`, `customer`, `parking_site`
* `etag` -> Has Many `etag_logs` (`etagId`)
* `etag_logs` -> Belongs To `etag`, `payment`, `parking_site`
