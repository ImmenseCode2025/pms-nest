-- =====================================================================
-- Sync triggers: corporate_cards
-- `corporate_cards` mein koi bhi insert / update / delete (NestJS ya Python service sy)
-- `sync_changes` mein log hota hai -> site servers POST /api/sync/corporate-cards sy uthate hain (local vip_vehicles).
--
-- Pehle `sync_changes` table chahiye (migration 20261112160000_sync_changes.js).
-- Dobara chalana safe hai (DROP IF EXISTS).
-- =====================================================================

DROP TRIGGER IF EXISTS trg_corporate_cards_sync_insert;
DROP TRIGGER IF EXISTS trg_corporate_cards_sync_update;
DROP TRIGGER IF EXISTS trg_corporate_cards_sync_delete;

CREATE TRIGGER trg_corporate_cards_sync_insert AFTER INSERT ON corporate_cards
FOR EACH ROW
  INSERT INTO sync_changes (table_name, record_id, action) VALUES ('corporate_cards', NEW.id, 'insert');

CREATE TRIGGER trg_corporate_cards_sync_update AFTER UPDATE ON corporate_cards
FOR EACH ROW
  INSERT INTO sync_changes (table_name, record_id, action) VALUES ('corporate_cards', NEW.id, 'update');

CREATE TRIGGER trg_corporate_cards_sync_delete AFTER DELETE ON corporate_cards
FOR EACH ROW
  INSERT INTO sync_changes (table_name, record_id, action) VALUES ('corporate_cards', OLD.id, 'delete');
