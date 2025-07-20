#!/usr/bin/env node

const { DataSource } = require('typeorm');
const { seedDatabase } = require('./dist/database/seed');

async function main() {
  console.log('Setting up database connection...');
  
  const dataSource = new DataSource({
    type: 'sqlite',
    database: 'database.sqlite',
    entities: [
      'dist/core/product/entities/product.entity.js',
      'dist/core/product/entities/category.entity.js',
      'dist/core/cart/entities/cart.entity.js',
      'dist/core/auth/entities/user.entity.js',
    ],
    synchronize: true,
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('Database connected successfully!');
    
    await seedDatabase(dataSource);
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await dataSource.destroy();
    console.log('Database connection closed.');
  }
}

main();
