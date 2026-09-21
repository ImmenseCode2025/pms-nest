/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('gallery', function (table) {
        table.increments('id');
        table.integer('galleryable_id', 11).nullable();
        table.string('galleryable_type', 255).nullable();
        table.text('file_path').nullable();
        table.string('file_type', 255).nullable();
        table.integer('related_id', 11).nullable().defaultTo(0);
        table.string('related_type', 255).nullable();
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('gallery');
};
