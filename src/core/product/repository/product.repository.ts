import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like, Between } from 'typeorm';
import { BaseRepository } from '../../../common/baseRepository.repository';
import { Product } from '../entities/product.entity';
import { ProductQueryDto } from '../dto/product.dto';

@Injectable()
export class ProductRepository extends BaseRepository<Product> {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {
    super(productRepository);
  }

  async findWithFilters(queryDto: ProductQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      categoryId,
      brand,
      color,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryDto;

    const queryBuilder = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.isActive = :isActive', { isActive: true });

    // Apply search filter
    if (search) {
      queryBuilder.andWhere(
        '(product.name LIKE :search OR product.description LIKE :search OR product.brand LIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply category filter
    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    // Apply brand filter
    if (brand) {
      queryBuilder.andWhere('product.brand = :brand', { brand });
    }

    // Apply color filter
    if (color) {
      queryBuilder.andWhere('product.color = :color', { color });
    }

    // Apply price range filter
    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    // Apply sorting
    queryBuilder.orderBy(`product.${sortBy}`, sortOrder);

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute query
    const [products, total] = await queryBuilder.getManyAndCount();

    return {
      data: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findFeaturedProducts(limit: number = 10): Promise<Product[]> {
    return await this.productRepository.find({
      where: { isFeatured: true, isActive: true },
      relations: ['category'],
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async findSaleProducts(limit: number = 10): Promise<Product[]> {
    return await this.productRepository.find({
      where: { isActive: true },
      relations: ['category'],
      take: limit,
      order: { discountPercentage: 'DESC' },
    });
  }

  async findByCategory(categoryId: string, limit: number = 10): Promise<Product[]> {
    return await this.productRepository.find({
      where: { categoryId, isActive: true },
      relations: ['category'],
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async findByBrand(brand: string, limit: number = 10): Promise<Product[]> {
    return await this.productRepository.find({
      where: { brand, isActive: true },
      relations: ['category'],
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async updateStock(productId: string, quantity: number): Promise<void> {
    await this.productRepository.update(productId, { stock: quantity });
  }

  async decreaseStock(productId: string, quantity: number): Promise<void> {
    await this.productRepository.decrement({ id: productId }, 'stock', quantity);
  }

  async increaseStock(productId: string, quantity: number): Promise<void> {
    await this.productRepository.increment({ id: productId }, 'stock', quantity);
  }

  async findWithDetails(id: string): Promise<Product | null> {
    return await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });
  }
}
