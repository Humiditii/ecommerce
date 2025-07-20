import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CartRepository } from './repository/cart.repository';
import { ProductRepository } from '../product/repository/product.repository';
import { AddToCartDto, UpdateCartItemDto, CartSummaryDto, CartItemResponseDto } from './dto/cart.dto';
import { CartItem } from './entities/cart.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async addToCart(sessionId: string, addToCartDto: AddToCartDto): Promise<CartItem> {
    const { productId, quantity, selectedSize, selectedColor } = addToCartDto;

    // Validate quantity
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than zero');
    }

    // Verify product exists and is active
    const product = await this.productRepository.findById(productId);
    if (!product || !product.isActive) {
      throw new BadRequestException('Product not found or inactive');
    }

    // Check stock availability
    if (product.stock < quantity) {
      throw new BadRequestException('Insufficient stock available');
    }

    // Check if item already exists in cart with same specifications
    const existingItem = await this.cartRepository.findBySessionAndProduct(
      sessionId,
      productId,
      selectedSize,
      selectedColor,
    );

    if (existingItem) {
      // Update quantity if item exists
      const newQuantity = existingItem.quantity + quantity;
      
      if (product.stock < newQuantity) {
        throw new BadRequestException('Insufficient stock for requested quantity');
      }

      await this.cartRepository.updateQuantity(existingItem.id, newQuantity);
      return await this.cartRepository.findCartItemWithProduct(existingItem.id);
    }

    // Create new cart item
    const cartItem = await this.cartRepository.create({
      sessionId,
      productId,
      quantity,
      selectedSize,
      selectedColor,
      price: product.price,
    });

    return await this.cartRepository.findCartItemWithProduct(cartItem.id);
  }

  async getCart(sessionId: string): Promise<CartSummaryDto> {
    const cartItems = await this.cartRepository.findBySessionId(sessionId);
    
    // Calculate totals
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    
    // Fixed shipping and import charges (could be dynamic based on business logic)
    const shipping = subtotal > 500 ? 0 : 40.00; // Free shipping over $500
    const importCharges = subtotal * 0.10; // 10% import charges
    const total = subtotal + shipping + importCharges;

    // Transform cart items
    const items: CartItemResponseDto[] = cartItems.map(item => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      productImage: item.product.image,
      productBrand: item.product.brand,
      productModel: item.product.model,
      quantity: item.quantity,
      price: item.price,
      totalPrice: item.price * item.quantity,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    return {
      totalItems,
      subtotal: Math.round(subtotal * 100) / 100,
      shipping: Math.round(shipping * 100) / 100,
      importCharges: Math.round(importCharges * 100) / 100,
      total: Math.round(total * 100) / 100,
      items,
    };
  }

  async updateCartItem(sessionId: string, itemId: string, updateDto: UpdateCartItemDto): Promise<CartItem> {
    const cartItem = await this.cartRepository.findCartItemWithProduct(itemId);
    
    if (!cartItem || cartItem.sessionId !== sessionId) {
      throw new NotFoundException('Cart item not found');
    }

    // Validate quantity
    if (updateDto.quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than zero');
    }

    // Check stock availability for new quantity
    if (cartItem.product.stock < updateDto.quantity) {
      throw new BadRequestException('Insufficient stock for requested quantity');
    }

    await this.cartRepository.update(itemId, updateDto);
    return await this.cartRepository.findCartItemWithProduct(itemId);
  }

  async removeFromCart(sessionId: string, itemId: string): Promise<void> {
    const cartItem = await this.cartRepository.findOne({
      where: { id: itemId, sessionId },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartRepository.removeItem(itemId);
  }

  async clearCart(sessionId: string): Promise<void> {
    await this.cartRepository.clearCart(sessionId);
  }

  async getCartItemCount(sessionId: string): Promise<number> {
    return await this.cartRepository.getCartItemCount(sessionId);
  }

  async getCartTotal(sessionId: string): Promise<number> {
    return await this.cartRepository.getCartTotal(sessionId);
  }

  generateSessionId(): string {
    return uuidv4();
  }


  async estimateShipping(sessionId: string, address: any): Promise<number> {
    // Placeholder for shipping calculation logic
    // This would typically involve calculating shipping based on address,
    // weight, dimensions, etc.
    const cart = await this.getCart(sessionId);
    return cart.subtotal > 500 ? 0 : 40.00;
  }
}
