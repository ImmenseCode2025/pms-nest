/**
 * POS device ki history — kisne banaya, kisne kis site par assign kiya, kya badla, kisne delete kiya.
 * Ek hi table, har badli hui field ki ek row.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable('pos_device_logs', function (table) {
    table.increments('id').primary();
    table.integer('pos_device_id').nullable().defaultTo(0);
    table.integer('user_id').nullable().defaultTo(0); // kisne kiya
    table.string('action', 30).nullable(); // created | assigned | updated | deleted
    table.string('field', 50).nullable(); // kaunsi field badli (site_id, bank, serial_number)
    table.string('old_value', 255).nullable();
    table.string('new_value', 255).nullable();
    table.text('description').nullable(); // screen par dikhane wala message
    table.timestamps(true, true);
    table.index(['pos_device_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('pos_device_logs');
};
