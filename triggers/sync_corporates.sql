-- =====================================================================
-- Sync triggers: corporates
-- `corporates` mein koi bhi insert / update / delete (NestJS ya Python service sy)
-- `sync_changes` mein log hota hai -> site servers GET /api/sync/corporates sy uthate hain.
--
-- Pehle `sync_changes` table chahiye (migration 20261112160000_sync_changes.js).
-- Dobara chalana safe hai (DROP IF EXISTS).
-- =====================================================================

DROP TRIGGER IF EXISTS trg_corporates_sync_insert;
DROP TRIGGER IF EXISTS trg_corporates_sync_update;
DROP TRIGGER IF EXISTS trg_corporates_sync_delete;

CREATE TRIGGER trg_corporates_sync_insert AFTER INSERT ON corporates
FOR EACH ROW
  INSERT INTO sync_changes (table_name, record_id, action) VALUES ('corporates', NEW.id, 'insert');

CREATE TRIGGER trg_corporates_sync_update AFTER UPDATE ON corporates
FOR EACH ROW
  INSERT INTO sync_changes (table_name, record_id, action) VALUES ('corporates', NEW.id, 'update');

CREATE TRIGGER trg_corporates_sync_delete AFTER DELETE ON corporates
FOR EACH ROW
  INSERT INTO sync_changes (table_name, record_id, action) VALUES ('corporates', OLD.id, 'delete');
