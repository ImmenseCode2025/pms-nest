-- =====================================================================
-- Sync triggers: operators
-- `operators` mein koi bhi insert / update / delete (NestJS ya Python service sy)
-- `sync_changes` mein log hota hai -> site servers POST /api/sync/operators sy uthate hain.
--
-- Pehle `sync_changes` table chahiye (migration 20261112160000_sync_changes.js).
-- Dobara chalana safe hai (DROP IF EXISTS).
-- =====================================================================

DROP TRIGGER IF EXISTS trg_operators_sync_insert;
DROP TRIGGER IF EXISTS trg_operators_sync_update;
DROP TRIGGER IF EXISTS trg_operators_sync_delete;

CREATE TRIGGER trg_operators_sync_insert AFTER INSERT ON operators
FOR EACH ROW
  INSERT INTO sync_changes (table_name, record_id, action) VALUES ('operators', NEW.id, 'insert');

CREATE TRIGGER trg_operators_sync_update AFTER UPDATE ON operators
FOR EACH ROW
  INSERT INTO sync_changes (table_name, record_id, action) VALUES ('operators', NEW.id, 'update');

CREATE TRIGGER trg_operators_sync_delete AFTER DELETE ON operators
FOR EACH ROW
  INSERT INTO sync_changes (table_name, record_id, action) VALUES ('operators', OLD.id, 'delete');
