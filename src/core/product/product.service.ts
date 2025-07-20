import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ProductRepository } from './repository/product.repository';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto/product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    try {
    
      if (createProductDto.originalPrice && createProductDto.price) {
        const discountAmount = createProductDto.originalPrice - createProductDto.price;
        const discountPercentage = (discountAmount / createProductDto.originalPrice) * 100;
        createProductDto.discountPercentage = Math.round(discountPercentage * 100) / 100;
      }

      // Generate SKU if not provided
      if (!createProductDto.sku) {
        createProductDto.sku = this.generateSku(createProductDto.brand, createProductDto.model);
      }

      const product = await this.productRepository.create(createProductDto);
      return await this.productRepository.findWithDetails(product.id);
    } catch (error) {
      throw new BadRequestException('Failed to create product: ' + error.message);
    }
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    try {
      // Recalculate discount if price or original price is updated
      if (updateProductDto.originalPrice || updateProductDto.price) {
        const originalPrice = updateProductDto.originalPrice || product.originalPrice;
        const price = updateProductDto.price || product.price;
        
        if (originalPrice && price && originalPrice > price) {
          const discountAmount = originalPrice - price;
          const discountPercentage = (discountAmount / originalPrice) * 100;
          updateProductDto.discountPercentage = Math.round(discountPercentage * 100) / 100;
        }
      }

      await this.productRepository.update(id, updateProductDto);
      return await this.productRepository.findWithDetails(id);
    } catch (error) {
      throw new BadRequestException('Failed to update product: ' + error.message);
    }
  }

  async findAllProducts(queryDto: ProductQueryDto) {
    return await this.productRepository.findWithFilters(queryDto);
  }

  async findProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findWithDetails(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.productRepository.delete(id);
  }

  async findFeaturedProducts(limit: number = 10): Promise<Product[]> {
    return await this.productRepository.findFeaturedProducts(limit);
  }

  async findSaleProducts(limit: number = 10): Promise<Product[]> {
    return await this.productRepository.findSaleProducts(limit);
  }

  async findProductsByCategory(categoryId: string, limit: number = 10): Promise<Product[]> {
    return await this.productRepository.findByCategory(categoryId, limit);
  }

  async findProductsByBrand(brand: string, limit: number = 10): Promise<Product[]> {
    return await this.productRepository.findByBrand(brand, limit);
  }

  async updateStock(productId: string, quantity: number): Promise<void> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.productRepository.updateStock(productId, quantity);
  }

  async decreaseStock(productId: string, quantity: number): Promise<void> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.stock < quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    await this.productRepository.decreaseStock(productId, quantity);
  }

  async increaseStock(productId: string, quantity: number): Promise<void> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.productRepository.increaseStock(productId, quantity);
  }

  async searchProducts(searchTerm: string, limit: number = 10): Promise<Product[]> {
    const queryDto: ProductQueryDto = {
      search: searchTerm,
      limit,
      page: 1,
    };

    const result = await this.productRepository.findWithFilters(queryDto);
    return result.data;
  }

  private generateSku(brand: string, model: string): string {
    const brandPrefix = brand.substring(0, 3).toUpperCase();
    const modelPrefix = model.substring(0, 3).toUpperCase().replace(/\s/g, '');
    const timestamp = Date.now().toString().slice(-6);
    return `${brandPrefix}-${modelPrefix}-${timestamp}`;
  }
}
