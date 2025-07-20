import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { ProductRepository } from './repository/product.repository';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ProductService', () => {
  let service: ProductService;
  let repository: ProductRepository;

  const mockProductRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findWithDetails: jest.fn(),
    findWithFilters: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findFeaturedProducts: jest.fn(),
    findSaleProducts: jest.fn(),
    findByCategory: jest.fn(),
    findByBrand: jest.fn(),
    updateStock: jest.fn(),
    decreaseStock: jest.fn(),
    increaseStock: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: ProductRepository,
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    repository = module.get<ProductRepository>(ProductRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      const createProductDto = {
        name: 'Test Product',
        brand: 'Test Brand',
        model: 'Test Model',
        price: 100,
        stock: 10,
      };

      const createdProduct = { id: '1', ...createProductDto };
      
      mockProductRepository.create.mockResolvedValue(createdProduct);
      mockProductRepository.findWithDetails.mockResolvedValue(createdProduct);

      const result = await service.createProduct(createProductDto);

      expect(result).toEqual(createdProduct);
      expect(mockProductRepository.create).toHaveBeenCalledWith(
        expect.objectContaining(createProductDto)
      );
    });

    it('should calculate discount percentage when original price is provided', async () => {
      const createProductDto = {
        name: 'Test Product',
        brand: 'Test Brand',
        model: 'Test Model',
        price: 80,
        originalPrice: 100,
        stock: 10,
      };

      const createdProduct = { id: '1', ...createProductDto, discountPercentage: 20 };
      
      mockProductRepository.create.mockResolvedValue(createdProduct);
      mockProductRepository.findWithDetails.mockResolvedValue(createdProduct);

      const result = await service.createProduct(createProductDto);

      expect(result.discountPercentage).toBe(20);
    });

    it('should generate SKU when not provided', async () => {
      const createProductDto = {
        name: 'Test Product',
        brand: 'Test Brand',
        model: 'Test Model',
        price: 100,
        stock: 10,
      };

      const createdProduct = { id: '1', ...createProductDto };
      
      mockProductRepository.create.mockResolvedValue(createdProduct);
      mockProductRepository.findWithDetails.mockResolvedValue(createdProduct);

      await service.createProduct(createProductDto);

      expect(mockProductRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createProductDto,
          sku: expect.any(String),
        })
      );
    });
  });

  describe('findProductById', () => {
    it('should return a product when found', async () => {
      const product = { id: '1', name: 'Test Product' };
      mockProductRepository.findWithDetails.mockResolvedValue(product);

      const result = await service.findProductById('1');

      expect(result).toEqual(product);
      expect(mockProductRepository.findWithDetails).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when product not found', async () => {
      mockProductRepository.findWithDetails.mockResolvedValue(null);

      await expect(service.findProductById('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProduct', () => {
    it('should update a product successfully', async () => {
      const product = { id: '1', name: 'Test Product', price: 100 };
      const updateDto = { name: 'Updated Product' };
      const updatedProduct = { ...product, ...updateDto };

      mockProductRepository.findById.mockResolvedValue(product);
      mockProductRepository.update.mockResolvedValue(undefined);
      mockProductRepository.findWithDetails.mockResolvedValue(updatedProduct);

      const result = await service.updateProduct('1', updateDto);

      expect(result).toEqual(updatedProduct);
      expect(mockProductRepository.update).toHaveBeenCalledWith('1', updateDto);
    });

    it('should throw NotFoundException when product not found', async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(service.updateProduct('1', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product successfully', async () => {
      const product = { id: '1', name: 'Test Product' };
      mockProductRepository.findById.mockResolvedValue(product);
      mockProductRepository.delete.mockResolvedValue(undefined);

      await service.deleteProduct('1');

      expect(mockProductRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when product not found', async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(service.deleteProduct('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('decreaseStock', () => {
    it('should decrease stock successfully', async () => {
      const product = { id: '1', stock: 10 };
      mockProductRepository.findById.mockResolvedValue(product);
      mockProductRepository.decreaseStock.mockResolvedValue(undefined);

      await service.decreaseStock('1', 5);

      expect(mockProductRepository.decreaseStock).toHaveBeenCalledWith('1', 5);
    });

    it('should throw BadRequestException when insufficient stock', async () => {
      const product = { id: '1', stock: 3 };
      mockProductRepository.findById.mockResolvedValue(product);

      await expect(service.decreaseStock('1', 5)).rejects.toThrow(BadRequestException);
    });
  });

  describe('increaseStock', () => {
    it('should increase stock successfully', async () => {
      const product = { id: '1', stock: 10 };
      mockProductRepository.findById.mockResolvedValue(product);
      mockProductRepository.increaseStock.mockResolvedValue(undefined);

      await service.increaseStock('1', 5);

      expect(mockProductRepository.increaseStock).toHaveBeenCalledWith('1', 5);
    });

    it('should throw NotFoundException when product not found', async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(service.increaseStock('1', 5)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllProducts', () => {
    it('should return filtered products', async () => {
      const queryDto = { page: 1, limit: 10, search: 'Nike' };
      const mockResult = {
        data: [{ id: '1', name: 'Nike Air Max', brand: 'Nike' }],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      mockProductRepository.findWithFilters.mockResolvedValue(mockResult);

      const result = await service.findAllProducts(queryDto);

      expect(result).toEqual(mockResult);
      expect(mockProductRepository.findWithFilters).toHaveBeenCalledWith(queryDto);
    });
  });

  describe('findFeaturedProducts', () => {
    it('should return featured products', async () => {
      const featuredProducts = [{ id: '1', name: 'Featured Product', isFeatured: true }];
      mockProductRepository.findFeaturedProducts.mockResolvedValue(featuredProducts);

      const result = await service.findFeaturedProducts(5);

      expect(result).toEqual(featuredProducts);
      expect(mockProductRepository.findFeaturedProducts).toHaveBeenCalledWith(5);
    });
  });

  describe('findSaleProducts', () => {
    it('should return sale products', async () => {
      const saleProducts = [{ id: '1', name: 'Sale Product', discountPercentage: 20 }];
      mockProductRepository.findSaleProducts.mockResolvedValue(saleProducts);

      const result = await service.findSaleProducts(5);

      expect(result).toEqual(saleProducts);
      expect(mockProductRepository.findSaleProducts).toHaveBeenCalledWith(5);
    });
  });

  describe('searchProducts', () => {
    it('should search products and return results', async () => {
      const searchResults = {
        data: [{ id: '1', name: 'Nike Air Max', brand: 'Nike' }],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      mockProductRepository.findWithFilters.mockResolvedValue(searchResults);

      const result = await service.searchProducts('Nike', 10);

      expect(result).toEqual(searchResults.data);
      expect(mockProductRepository.findWithFilters).toHaveBeenCalledWith({
        search: 'Nike',
        limit: 10,
        page: 1,
      });
    });
  });

  describe('updateStock', () => {
    it('should update stock successfully', async () => {
      const product = { id: '1', stock: 10 };
      mockProductRepository.findById.mockResolvedValue(product);
      mockProductRepository.updateStock.mockResolvedValue(undefined);

      await service.updateStock('1', 20);

      expect(mockProductRepository.updateStock).toHaveBeenCalledWith('1', 20);
    });

    it('should throw NotFoundException when product not found', async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(service.updateStock('1', 20)).rejects.toThrow(NotFoundException);
    });
  });
});
