import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { CartRepository } from './repository/cart.repository';
import { ProductRepository } from '../product/repository/product.repository';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('CartService', () => {
  let service: CartService;
  let cartRepository: CartRepository;
  let productRepository: ProductRepository;

  const mockCartRepository = {
    create: jest.fn(),
    findBySessionId: jest.fn(),
    findBySessionAndProduct: jest.fn(),
    findCartItemWithProduct: jest.fn(),
    updateQuantity: jest.fn(),
    update: jest.fn(),
    findOne: jest.fn(),
    removeItem: jest.fn(),
    clearCart: jest.fn(),
    getCartItemCount: jest.fn(),
    getCartTotal: jest.fn(),
  };

  const mockProductRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: CartRepository,
          useValue: mockCartRepository,
        },
        {
          provide: ProductRepository,
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    cartRepository = module.get<CartRepository>(CartRepository);
    productRepository = module.get<ProductRepository>(ProductRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addToCart', () => {
    it('should add item to cart successfully', async () => {
      const sessionId = 'test-session';
      const addToCartDto = {
        productId: '1',
        quantity: 2,
        selectedSize: '7',
        selectedColor: 'red',
      };

      const product = {
        id: '1',
        name: 'Test Product',
        price: 100,
        stock: 10,
        isActive: true,
      };

      const cartItem = {
        id: 'cart-item-1',
        sessionId,
        productId: '1',
        quantity: 2,
        price: 100,
        product,
      };

      mockProductRepository.findById.mockResolvedValue(product);
      mockCartRepository.findBySessionAndProduct.mockResolvedValue(null);
      mockCartRepository.create.mockResolvedValue(cartItem);
      mockCartRepository.findCartItemWithProduct.mockResolvedValue(cartItem);

      const result = await service.addToCart(sessionId, addToCartDto);

      expect(result).toEqual(cartItem);
      expect(mockCartRepository.create).toHaveBeenCalledWith({
        sessionId,
        productId: '1',
        quantity: 2,
        selectedSize: '7',
        selectedColor: 'red',
        price: 100,
      });
    });

    it('should throw BadRequestException when product not found', async () => {
      const sessionId = 'test-session';
      const addToCartDto = {
        productId: '1',
        quantity: 2,
      };

      mockProductRepository.findById.mockResolvedValue(null);

      await expect(service.addToCart(sessionId, addToCartDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when insufficient stock', async () => {
      const sessionId = 'test-session';
      const addToCartDto = {
        productId: '1',
        quantity: 15,
      };

      const product = {
        id: '1',
        name: 'Test Product',
        price: 100,
        stock: 10,
        isActive: true,
      };

      mockProductRepository.findById.mockResolvedValue(product);

      await expect(service.addToCart(sessionId, addToCartDto)).rejects.toThrow(BadRequestException);
    });

    it('should update quantity when item already exists in cart', async () => {
      const sessionId = 'test-session';
      const addToCartDto = {
        productId: '1',
        quantity: 2,
      };

      const product = {
        id: '1',
        name: 'Test Product',
        price: 100,
        stock: 10,
        isActive: true,
      };

      const existingCartItem = {
        id: 'cart-item-1',
        sessionId,
        productId: '1',
        quantity: 1,
        price: 100,
      };

      const updatedCartItem = {
        ...existingCartItem,
        quantity: 3,
        product,
      };

      mockProductRepository.findById.mockResolvedValue(product);
      mockCartRepository.findBySessionAndProduct.mockResolvedValue(existingCartItem);
      mockCartRepository.updateQuantity.mockResolvedValue(undefined);
      mockCartRepository.findCartItemWithProduct.mockResolvedValue(updatedCartItem);

      const result = await service.addToCart(sessionId, addToCartDto);

      expect(result).toEqual(updatedCartItem);
      expect(mockCartRepository.updateQuantity).toHaveBeenCalledWith('cart-item-1', 3);
    });
  });

  describe('getCart', () => {
    it('should return cart summary', async () => {
      const sessionId = 'test-session';
      const cartItems = [
        {
          id: 'cart-item-1',
          sessionId,
          productId: '1',
          quantity: 2,
          price: 100,
          product: {
            id: '1',
            name: 'Test Product 1',
            image: 'image1.jpg',
            brand: 'Brand1',
            model: 'Model1',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'cart-item-2',
          sessionId,
          productId: '2',
          quantity: 1,
          price: 200,
          product: {
            id: '2',
            name: 'Test Product 2',
            image: 'image2.jpg',
            brand: 'Brand2',
            model: 'Model2',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockCartRepository.findBySessionId.mockResolvedValue(cartItems);

      const result = await service.getCart(sessionId);

      expect(result.totalItems).toBe(3);
      expect(result.subtotal).toBe(400);
      expect(result.items).toHaveLength(2);
    });

    it('should return empty cart when no items', async () => {
      const sessionId = 'test-session';
      mockCartRepository.findBySessionId.mockResolvedValue([]);

      const result = await service.getCart(sessionId);

      expect(result.totalItems).toBe(0);
      expect(result.subtotal).toBe(0);
      expect(result.items).toHaveLength(0);
    });
  });

  describe('updateCartItem', () => {
    it('should update cart item successfully', async () => {
      const sessionId = 'test-session';
      const itemId = 'cart-item-1';
      const updateDto = { quantity: 3 };

      const cartItem = {
        id: itemId,
        sessionId,
        productId: '1',
        quantity: 2,
        product: {
          id: '1',
          stock: 10,
        },
      };

      const updatedCartItem = {
        ...cartItem,
        quantity: 3,
      };

      mockCartRepository.findCartItemWithProduct.mockResolvedValue(cartItem);
      mockCartRepository.update.mockResolvedValue(undefined);
      mockCartRepository.findCartItemWithProduct.mockResolvedValue(updatedCartItem);

      const result = await service.updateCartItem(sessionId, itemId, updateDto);

      expect(result).toEqual(updatedCartItem);
      expect(mockCartRepository.update).toHaveBeenCalledWith(itemId, updateDto);
    });

    it('should throw NotFoundException when cart item not found', async () => {
      const sessionId = 'test-session';
      const itemId = 'cart-item-1';
      const updateDto = { quantity: 3 };

      mockCartRepository.findCartItemWithProduct.mockResolvedValue(null);

      await expect(service.updateCartItem(sessionId, itemId, updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when insufficient stock', async () => {
      const sessionId = 'test-session';
      const itemId = 'cart-item-1';
      const updateDto = { quantity: 15 };

      const cartItem = {
        id: itemId,
        sessionId,
        productId: '1',
        quantity: 2,
        product: {
          id: '1',
          stock: 10,
        },
      };

      mockCartRepository.findCartItemWithProduct.mockResolvedValue(cartItem);

      await expect(service.updateCartItem(sessionId, itemId, updateDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart successfully', async () => {
      const sessionId = 'test-session';
      const itemId = 'cart-item-1';

      const cartItem = {
        id: itemId,
        sessionId,
        productId: '1',
      };

      mockCartRepository.findOne.mockResolvedValue(cartItem);
      mockCartRepository.removeItem.mockResolvedValue(undefined);

      await service.removeFromCart(sessionId, itemId);

      expect(mockCartRepository.removeItem).toHaveBeenCalledWith(itemId);
    });

    it('should throw BadRequestException when cart item not found', async () => {
      const sessionId = 'test-session';
      const itemId = 'cart-item-1';

      mockCartRepository.findOne.mockResolvedValue(null);

      await expect(service.removeFromCart(sessionId, itemId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('clearCart', () => {
    it('should clear cart successfully', async () => {
      const sessionId = 'test-session';

      mockCartRepository.clearCart.mockResolvedValue(undefined);

      await service.clearCart(sessionId);

      expect(mockCartRepository.clearCart).toHaveBeenCalledWith(sessionId);
    });
  });

  describe('generateSessionId', () => {
    it('should generate a valid UUID', () => {
      const sessionId = service.generateSessionId();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(sessionId).toMatch(uuidRegex);
    });

    it('should generate unique session IDs', () => {
      const sessionId1 = service.generateSessionId();
      const sessionId2 = service.generateSessionId();
      expect(sessionId1).not.toBe(sessionId2);
    });
  });

  describe('addToCart - Edge Cases', () => {
    it('should throw BadRequestException when product is inactive', async () => {
      const sessionId = 'test-session';
      const addToCartDto = {
        productId: '1',
        quantity: 2,
      };

      const product = {
        id: '1',
        name: 'Test Product',
        price: 100,
        stock: 10,
        isActive: false,
      };

      mockProductRepository.findById.mockResolvedValue(product);

      await expect(service.addToCart(sessionId, addToCartDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when quantity is zero or negative', async () => {
      const sessionId = 'test-session';
      const addToCartDto = {
        productId: '1',
        quantity: 0,
      };

      const product = {
        id: '1',
        name: 'Test Product',
        price: 100,
        stock: 10,
        isActive: true,
      };

      mockProductRepository.findById.mockResolvedValue(product);

      await expect(service.addToCart(sessionId, addToCartDto)).rejects.toThrow(BadRequestException);
    });

    it('should handle repository errors gracefully', async () => {
      const sessionId = 'test-session';
      const addToCartDto = {
        productId: '1',
        quantity: 2,
      };

      mockProductRepository.findById.mockRejectedValue(new Error('Database error'));

      await expect(service.addToCart(sessionId, addToCartDto)).rejects.toThrow('Database error');
    });

    it('should handle total quantity check when updating existing item', async () => {
      const sessionId = 'test-session';
      const addToCartDto = {
        productId: '1',
        quantity: 8,
      };

      const product = {
        id: '1',
        name: 'Test Product',
        price: 100,
        stock: 10,
        isActive: true,
      };

      const existingCartItem = {
        id: 'cart-item-1',
        sessionId,
        productId: '1',
        quantity: 5,
        price: 100,
      };

      mockProductRepository.findById.mockResolvedValue(product);
      mockCartRepository.findBySessionAndProduct.mockResolvedValue(existingCartItem);

      await expect(service.addToCart(sessionId, addToCartDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateCartItem - Edge Cases', () => {
    it('should throw BadRequestException when quantity is zero or negative', async () => {
      const sessionId = 'test-session';
      const itemId = 'cart-item-1';
      const updateDto = { quantity: -1 };

      const cartItem = {
        id: itemId,
        sessionId,
        productId: '1',
        quantity: 2,
        product: {
          id: '1',
          stock: 10,
        },
      };

      mockCartRepository.findCartItemWithProduct.mockResolvedValue(cartItem);

      await expect(service.updateCartItem(sessionId, itemId, updateDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when cart item belongs to different session', async () => {
      const sessionId = 'test-session';
      const itemId = 'cart-item-1';
      const updateDto = { quantity: 3 };

      const cartItem = {
        id: itemId,
        sessionId: 'different-session',
        productId: '1',
        quantity: 2,
        product: {
          id: '1',
          stock: 10,
        },
      };

      mockCartRepository.findCartItemWithProduct.mockResolvedValue(cartItem);

      await expect(service.updateCartItem(sessionId, itemId, updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should handle repository update errors', async () => {
      const sessionId = 'test-session';
      const itemId = 'cart-item-1';
      const updateDto = { quantity: 3 };

      const cartItem = {
        id: itemId,
        sessionId,
        productId: '1',
        quantity: 2,
        product: {
          id: '1',
          stock: 10,
        },
      };

      mockCartRepository.findCartItemWithProduct.mockResolvedValue(cartItem);
      mockCartRepository.update.mockRejectedValue(new Error('Update failed'));

      await expect(service.updateCartItem(sessionId, itemId, updateDto)).rejects.toThrow('Update failed');
    });
  });

  describe('removeFromCart - Edge Cases', () => {
    it('should throw NotFoundException when cart item belongs to different session', async () => {
      const sessionId = 'test-session';
      const itemId = 'cart-item-1';

      // Repository would return null when querying with mismatched sessionId
      mockCartRepository.findOne.mockResolvedValue(null);

      await expect(service.removeFromCart(sessionId, itemId)).rejects.toThrow(NotFoundException);
    });

    it('should handle repository removal errors', async () => {
      const sessionId = 'test-session';
      const itemId = 'cart-item-1';

      const cartItem = {
        id: itemId,
        sessionId,
        productId: '1',
      };

      mockCartRepository.findOne.mockResolvedValue(cartItem);
      mockCartRepository.removeItem.mockRejectedValue(new Error('Removal failed'));

      await expect(service.removeFromCart(sessionId, itemId)).rejects.toThrow('Removal failed');
    });
  });

  describe('getCart - Edge Cases', () => {
    it('should handle repository errors when fetching cart', async () => {
      const sessionId = 'test-session';
      mockCartRepository.findBySessionId.mockRejectedValue(new Error('Database error'));

      await expect(service.getCart(sessionId)).rejects.toThrow('Database error');
    });

    it('should calculate correct totals with decimal prices', async () => {
      const sessionId = 'test-session';
      const cartItems = [
        {
          id: 'cart-item-1',
          sessionId,
          productId: '1',
          quantity: 3,
          price: 99.99,
          product: {
            id: '1',
            name: 'Test Product 1',
            image: 'image1.jpg',
            brand: 'Brand1',
            model: 'Model1',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'cart-item-2',
          sessionId,
          productId: '2',
          quantity: 2,
          price: 149.50,
          product: {
            id: '2',
            name: 'Test Product 2',
            image: 'image2.jpg',
            brand: 'Brand2',
            model: 'Model2',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockCartRepository.findBySessionId.mockResolvedValue(cartItems);

      const result = await service.getCart(sessionId);

      expect(result.totalItems).toBe(5);
      expect(result.subtotal).toBe(598.97); // 3 * 99.99 + 2 * 149.50
      expect(result.items).toHaveLength(2);
    });
  });

  describe('clearCart - Edge Cases', () => {
    it('should handle repository clear errors', async () => {
      const sessionId = 'test-session';
      mockCartRepository.clearCart.mockRejectedValue(new Error('Clear failed'));

      await expect(service.clearCart(sessionId)).rejects.toThrow('Clear failed');
    });
  });

  // Reset mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });
});
