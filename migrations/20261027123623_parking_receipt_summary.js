/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('parking_receipt_summary', function (table) {
    table.increments('id');
    table.integer('totalTickets').nullable().defaultTo(0);
    table.integer('paidCarTickets').nullable().defaultTo(0);
    table.integer('paidVanTickets').nullable().defaultTo(0);
    table.integer('paidBusTickets').nullable().defaultTo(0);
    table.integer('paidBikeTickets').nullable().defaultTo(0);
    table.integer('focTickets').nullable().defaultTo(0);
    table.integer('focCarTickets').nullable().defaultTo(0);
    table.integer('focVanTickets').nullable().defaultTo(0);
    table.integer('focBusTickets').nullable().defaultTo(0);
    table.integer('focBikeTickets').nullable().defaultTo(0);
    table.integer('siteId').nullable().defaultTo(0);
    table.integer('handheldId').nullable().defaultTo(0);
    table.integer('operatorId').nullable().defaultTo(0);
    table.date('summary_date').nullable();
    table.decimal('totalRevenue', 20, 2).nullable().defaultTo(0);
    table.decimal('submittedAmount', 20, 2).nullable().defaultTo(0);
    table.decimal('varianceAmount', 20, 2).nullable().defaultTo(0);
    table.timestamps(true, true);
  });
};
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('parking_receipt_summary');
};
