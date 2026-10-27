/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('operators', function (table) {
    table.increments('id');
    table.string('username', 255).nullable();
    table.string('mobile', 255).nullable();
    table.string('email', 255).nullable();
    table.string('cnic', 255).nullable();
    table.integer('site_id').nullable().defaultTo(0);
    table.integer('supervisor_id').nullable().defaultTo(0);
    table.string('password', 255).nullable();
    table.text('profile_image', 255).nullable();
    table.string('status', 255).nullable().defaultTo('active');
    table.timestamps(true, true);
  });
};
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('operators');
};
