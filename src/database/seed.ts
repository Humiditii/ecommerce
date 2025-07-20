import { DataSource } from 'typeorm';
import { Product } from '../core/product/entities/product.entity';
import { Category } from '../core/product/entities/category.entity';
import { User, UserRole } from '../core/auth/entities/user.entity';
import * as bcrypt from 'bcrypt';

export async function seedDatabase(dataSource: DataSource) {
  console.log('Starting database seeding...');

  // Create categories
  const categoryRepository = dataSource.getRepository(Category);
  
  const categories = [
    {
      name: 'Men Shoes',
      description: 'Shoes for men',
      icon: '👟',
      isActive: true,
    },
    {
      name: 'Women Shoes',
      description: 'Shoes for women',
      icon: '👠',
      isActive: true,
    },
    {
      name: 'Sports Shoes',
      description: 'Athletic and sports shoes',
      icon: '🏃',
      isActive: true,
    },
    {
      name: 'Casual Shoes',
      description: 'Everyday casual shoes',
      icon: '👞',
      isActive: true,
    },
  ];

  const savedCategories = await categoryRepository.save(categories);
  console.log('Categories seeded successfully');

  // Create products
  const productRepository = dataSource.getRepository(Product);
  
  const products = [
    {
      name: 'Nike Air Max 270',
      description: 'The Nike Air Max 270 delivers visible heel Air cushioning and a stretchy inner sleeve for a comfortable, secure fit.',
      price: 299.43,
      originalPrice: 399.99,
      discountPercentage: 25,
      brand: 'Nike',
      model: 'Air Max 270',
      color: 'Red',
      sizes: ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10'],
      stock: 50,
      image: 'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/skdjfh23kj/air-max-270-mens-shoe-KkLcGR.png',
      images: [
        'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/skdjfh23kj/air-max-270-mens-shoe-KkLcGR.png',
        'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/awfawfawf/air-max-270-mens-shoe-side.png'
      ],
      sku: 'NIK-AM270-RED-001',
      rating: 4.5,
      reviewCount: 1247,
      isActive: true,
      isFeatured: true,
      categoryId: savedCategories[0].id,
    },
    {
      name: 'New Balance 570',
      description: 'Classic New Balance running shoes with superior comfort and durability.',
      price: 299.43,
      originalPrice: 349.99,
      discountPercentage: 14,
      brand: 'New Balance',
      model: '570',
      color: 'Navy Blue',
      sizes: ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5'],
      stock: 30,
      image: 'https://nb.scene7.com/is/image/NB/ml570bn2_nb_02_i?$pdpflexf2$&wid=440&hei=440',
      images: [
        'https://nb.scene7.com/is/image/NB/ml570bn2_nb_02_i?$pdpflexf2$&wid=440&hei=440',
        'https://nb.scene7.com/is/image/NB/ml570bn2_nb_03_i?$pdpflexf2$&wid=440&hei=440'
      ],
      sku: 'NB-570-NAV-001',
      rating: 4.2,
      reviewCount: 856,
      isActive: true,
      isFeatured: true,
      categoryId: savedCategories[2].id,
    },
    {
      name: 'Adidas Ultraboost 22',
      description: 'Experience incredible energy return with every step in these running shoes.',
      price: 359.99,
      originalPrice: 399.99,
      discountPercentage: 10,
      brand: 'Adidas',
      model: 'Ultraboost 22',
      color: 'Black',
      sizes: ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10'],
      stock: 45,
      image: 'https://assets.adidas.com/images/w_600,f_auto,q_auto/089d34cbf3d44e22b4b8ae4300c1c2d3_9366/Ultraboost_22_Shoes_Black_GZ0127_01_standard.jpg',
      images: [
        'https://assets.adidas.com/images/w_600,f_auto,q_auto/089d34cbf3d44e22b4b8ae4300c1c2d3_9366/Ultraboost_22_Shoes_Black_GZ0127_01_standard.jpg'
      ],
      sku: 'ADI-UB22-BLK-001',
      rating: 4.7,
      reviewCount: 2341,
      isActive: true,
      isFeatured: true,
      categoryId: savedCategories[2].id,
    },
    {
      name: 'Puma RS-X',
      description: 'Retro-inspired running shoes with modern comfort technology.',
      price: 179.99,
      originalPrice: 219.99,
      discountPercentage: 18,
      brand: 'Puma',
      model: 'RS-X',
      color: 'White',
      sizes: ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10'],
      stock: 25,
      image: 'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/369449/02/sv01/fnd/PNA/fmt/png/RS-X-Reinvention-Sneakers',
      images: [
        'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/369449/02/sv01/fnd/PNA/fmt/png/RS-X-Reinvention-Sneakers'
      ],
      sku: 'PUM-RSX-WHT-001',
      rating: 4.1,
      reviewCount: 623,
      isActive: true,
      isFeatured: false,
      categoryId: savedCategories[3].id,
    },
    {
      name: 'Converse Chuck Taylor All Star',
      description: 'Iconic canvas sneakers that never go out of style.',
      price: 89.99,
      originalPrice: 109.99,
      discountPercentage: 18,
      brand: 'Converse',
      model: 'Chuck Taylor All Star',
      color: 'Black',
      sizes: ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10'],
      stock: 60,
      image: 'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw8d8e6c6e/images/a_107/M9160C_A_107X1.jpg',
      images: [
        'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw8d8e6c6e/images/a_107/M9160C_A_107X1.jpg'
      ],
      sku: 'CON-CTAS-BLK-001',
      rating: 4.4,
      reviewCount: 3456,
      isActive: true,
      isFeatured: false,
      categoryId: savedCategories[3].id,
    },
    {
      name: 'Vans Old Skool',
      description: 'Classic skateboarding shoes with the iconic side stripe.',
      price: 129.99,
      originalPrice: 149.99,
      discountPercentage: 13,
      brand: 'Vans',
      model: 'Old Skool',
      color: 'Black/White',
      sizes: ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5'],
      stock: 40,
      image: 'https://images.vans.com/is/image/Vans/D3HY28-HERO?$583x583$',
      images: [
        'https://images.vans.com/is/image/Vans/D3HY28-HERO?$583x583$'
      ],
      sku: 'VAN-OS-BW-001',
      rating: 4.3,
      reviewCount: 1892,
      isActive: true,
      isFeatured: true,
      categoryId: savedCategories[3].id,
    },
    {
      name: 'Jordan Air Jordan 1 Mid',
      description: 'Inspired by the original AJ1, this mid-top edition creates a fresh take on classic style.',
      price: 399.99,
      originalPrice: 449.99,
      discountPercentage: 11,
      brand: 'Jordan',
      model: 'Air Jordan 1 Mid',
      color: 'Bred',
      sizes: ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11'],
      stock: 20,
      image: 'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/i1-665455a5-45de-40fb-945f-c1852b82400d/air-jordan-1-mid-shoes-SrDc2R.png',
      images: [
        'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/i1-665455a5-45de-40fb-945f-c1852b82400d/air-jordan-1-mid-shoes-SrDc2R.png'
      ],
      sku: 'JOR-AJ1-BRED-001',
      rating: 4.8,
      reviewCount: 2156,
      isActive: true,
      isFeatured: true,
      categoryId: savedCategories[0].id,
    },
    {
      name: 'Reebok Classic Leather',
      description: 'Simple, clean and classic. This is the shoe that defined athletic footwear.',
      price: 149.99,
      originalPrice: 179.99,
      discountPercentage: 17,
      brand: 'Reebok',
      model: 'Classic Leather',
      color: 'White',
      sizes: ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10'],
      stock: 35,
      image: 'https://assets.reebok.com/images/w_600,f_auto,q_auto/4d8c62b2c52e4bb3b3e8ad8400c3d9d3_9366/Classic_Leather_Shoes_White_2232.jpg',
      images: [
        'https://assets.reebok.com/images/w_600,f_auto,q_auto/4d8c62b2c52e4bb3b3e8ad8400c3d9d3_9366/Classic_Leather_Shoes_White_2232.jpg'
      ],
      sku: 'REE-CL-WHT-001',
      rating: 4.2,
      reviewCount: 1245,
      isActive: true,
      isFeatured: false,
      categoryId: savedCategories[3].id,
    },
  ];

  await productRepository.save(products);
  console.log('Products seeded successfully');

  // Create users
  const userRepository = dataSource.getRepository(User);
  
  const saltRounds = 12;
  const adminPassword = await bcrypt.hash('admin123', saltRounds);
  const userPassword = await bcrypt.hash('user123', saltRounds);
  
  const users = [
    {
      email: 'admin@example.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      isActive: true,
    },
    {
      email: 'user@example.com',
      password: userPassword,
      firstName: 'Regular',
      lastName: 'User',
      role: UserRole.USER,
      isActive: true,
    },
    {
      email: 'manager@example.com',
      password: userPassword,
      firstName: 'Manager',
      lastName: 'User',
      role: UserRole.MANAGER,
      isActive: true,
    },
  ];

  await userRepository.save(users);
  console.log('Users seeded successfully');
  console.log('Admin user: admin@example.com / admin123');
  console.log('Regular user: user@example.com / user123');
  console.log('Manager user: manager@example.com / user123');

  console.log('Database seeding completed!');
}
