/**
 * Site desktop app ka live connection status — har site ki ek row.
 * Socket connect = online, disconnect (grace k baad) = offline. Bharne wala: src/site-monitor/
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable('site_connectivity', function (table) {
    table.integer('site_id').primary();
    table.string('status', 10).notNullable().defaultTo('offline'); // online | offline
    table.dateTime('connected_at').nullable();
    table.dateTime('disconnected_at').nullable();
    table.dateTime('last_seen_at').nullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('site_connectivity');
};
