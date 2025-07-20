import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../common/baseRepository.repository';
import { CartItem } from '../entities/cart.entity';

@Injectable()
export class CartRepository extends BaseRepository<CartItem> {
  constructor(
    @InjectRepository(CartItem)
    private cartRepository: Repository<CartItem>,
  ) {
    super(cartRepository);
  }

  async findBySessionId(sessionId: string): Promise<CartItem[]> {
    return await this.cartRepository.find({
      where: { sessionId },
      relations: ['product', 'product.category'],
      order: { createdAt: 'DESC' },
    });
  }

  async findBySessionAndProduct(
    sessionId: string,
    productId: string,
    selectedSize?: string,
    selectedColor?: string,
  ): Promise<CartItem | null> {
    const whereCondition: any = { sessionId, productId };
    
    if (selectedSize) {
      whereCondition.selectedSize = selectedSize;
    }
    
    if (selectedColor) {
      whereCondition.selectedColor = selectedColor;
    }

    return await this.cartRepository.findOne({
      where: whereCondition,
      relations: ['product'],
    });
  }

  async removeBySessionAndProduct(
    sessionId: string,
    productId: string,
  ): Promise<void> {
    await this.cartRepository.delete({ sessionId, productId });
  }

  async clearCart(sessionId: string): Promise<void> {
    await this.cartRepository.delete({ sessionId });
  }

  async getCartItemCount(sessionId: string): Promise<number> {
    return await this.cartRepository.count({ where: { sessionId } });
  }

  async getCartTotal(sessionId: string): Promise<number> {
    const items = await this.findBySessionId(sessionId);
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  async findCartItemWithProduct(itemId: string): Promise<CartItem | null> {
    return await this.cartRepository.findOne({
      where: { id: itemId },
      relations: ['product'],
    });
  }

  async updateQuantity(itemId: string, quantity: number): Promise<void> {
    await this.cartRepository.update(itemId, { quantity });
  }

  async removeItem(itemId: string): Promise<void> {
    await this.cartRepository.delete(itemId);
  }
}
