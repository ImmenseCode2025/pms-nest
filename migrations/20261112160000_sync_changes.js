/**
 * Sync change log — local site servers (realpark) yahan sy `id > last_change_id` wali changes uthate hain.
 *
 * Is table ko triggers bharte hain — har synced table ki apni file: triggers/sync_<table>.sql
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable('sync_changes', function (table) {
    table.bigIncrements('id').primary();
    table.string('table_name', 100).notNullable();
    table.bigInteger('record_id').notNullable();
    table.string('action', 10).notNullable(); // insert | update | delete
    table.timestamps(true, true);
    table.index(['table_name', 'id'], 'sync_changes_table_id_index');
    table.index(['created_at'], 'sync_changes_created_at_index');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('sync_changes');
};
