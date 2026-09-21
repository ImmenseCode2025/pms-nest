const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Check if admin already exists
  const adminExists = await knex('users')
    .where({ email: 'admin@gmail.com' })
    .first();

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('Name123!', 10);

    await knex('users').insert({
      first_name: 'Admin',
      last_name: 'GRC',
      user_name: 'admin',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: 'admin',
      is_verified: true,
      auth_platform: 'app',
    });

    console.log('Admin user seeded.');
  } else {
    console.log('Admin user already exists.');
  }
};
