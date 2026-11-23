/**
 * POS devices — har site par lagi POS machines.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable('pos_device', function (table) {
    table.increments('id').primary();
    table.string('serial_number', 255).nullable();
    table.string('bank', 255).nullable();
    table.integer('site_id').nullable().defaultTo(0);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('pos_device');
};
