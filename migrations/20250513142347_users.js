/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('users', function (table) {
    table.increments('id');
    table.string('first_name', 255).nullable();
    table.string('last_name', 255).nullable();
    table.string('user_name', 255).nullable();
    table.string('country', 255).nullable();
    table.string('state', 255).nullable();
    table.string('city', 255).nullable();

    table.string('email', 255).nullable();
    table.string('phone_number', 255).nullable();
    table.string('auth_platform', 255).nullable().defaultTo('app');
    table.string('otp', 10).nullable();
    table.string('role', 20).nullable().defaultTo('user');
    table.text('bio').nullable();
    table.text('platform_token').nullable();
    table.text('password').nullable();
    table.text('profile_image').nullable();
    table.boolean('is_deleted', 255).nullable().defaultTo(false);
    table.boolean('save_mode', 255).nullable().defaultTo(false);
    table.boolean('is_private').defaultTo(false);
    table.boolean('is_verified').defaultTo(false);

    table.integer('posts_count').nullable().defaultTo(0);
    table.integer('followers_count').nullable().defaultTo(0);
    table.integer('following_count').nullable().defaultTo(0);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('users');
};
