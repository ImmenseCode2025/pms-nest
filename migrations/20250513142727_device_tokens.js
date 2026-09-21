/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('device_tokens', function (table) {
    table.increments('id');
    table.integer('user_id', 11).nullable();
    table.text('device_id').nullable();
    table.text('token').nullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('device_tokens');
};
