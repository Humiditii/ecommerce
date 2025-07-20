import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { AppResponse } from '../../common/appResponse.parser';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Cart')
@Controller('cart')
@Public()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  private success = AppResponse.success;
  private error = AppResponse.error;

  @Post()
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: 201, description: 'Item added to cart successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiHeader({ name: 'x-session-id', description: 'User session ID', required: true })
  async addToCart(
    @Body() addToCartDto: AddToCartDto,
    @Headers('x-session-id') sessionId: string,
    @Res() res: Response
  ) {
    try {
      if (!sessionId) {
        return res.status(HttpStatus.BAD_REQUEST).json(
          this.error('Session ID is required', HttpStatus.BAD_REQUEST)
        );
      }

      const cartItem = await this.cartService.addToCart(sessionId, addToCartDto);
      return res.status(HttpStatus.CREATED).json(
        this.success('Item added to cart successfully', HttpStatus.CREATED, cartItem)
      );
    } catch (error) {
      const status = error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST;
      return res.status(status).json(
        this.error('Failed to add item to cart', status, error.message)
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get cart contents' })
  @ApiResponse({ status: 200, description: 'Cart retrieved successfully' })
  @ApiHeader({ name: 'x-session-id', description: 'User session ID', required: true })
  async getCart(
    @Headers('x-session-id') sessionId: string,
    @Res() res: Response
  ) {
    try {
      if (!sessionId) {
        return res.status(HttpStatus.BAD_REQUEST).json(
          this.error('Session ID is required', HttpStatus.BAD_REQUEST)
        );
      }

      const cart = await this.cartService.getCart(sessionId);
      return res.status(HttpStatus.OK).json(
        this.success('Cart retrieved successfully', HttpStatus.OK, cart)
      );
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
        this.error('Failed to retrieve cart', HttpStatus.INTERNAL_SERVER_ERROR, error.message)
      );
    }
  }

  @Patch(':itemId')
  @ApiOperation({ summary: 'Update cart item' })
  @ApiResponse({ status: 200, description: 'Cart item updated successfully' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  @ApiHeader({ name: 'x-session-id', description: 'User session ID', required: true })
  async updateCartItem(
    @Param('itemId') itemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
    @Headers('x-session-id') sessionId: string,
    @Res() res: Response
  ) {
    try {
      if (!sessionId) {
        return res.status(HttpStatus.BAD_REQUEST).json(
          this.error('Session ID is required', HttpStatus.BAD_REQUEST)
        );
      }

      const cartItem = await this.cartService.updateCartItem(sessionId, itemId, updateCartItemDto);
      return res.status(HttpStatus.OK).json(
        this.success('Cart item updated successfully', HttpStatus.OK, cartItem)
      );
    } catch (error) {
      const status = error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST;
      return res.status(status).json(
        this.error('Failed to update cart item', status, error.message)
      );
    }
  }

  @Delete(':itemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({ status: 200, description: 'Item removed from cart successfully' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  @ApiHeader({ name: 'x-session-id', description: 'User session ID', required: true })
  async removeFromCart(
    @Param('itemId') itemId: string,
    @Headers('x-session-id') sessionId: string,
    @Res() res: Response
  ) {
    try {
      if (!sessionId) {
        return res.status(HttpStatus.BAD_REQUEST).json(
          this.error('Session ID is required', HttpStatus.BAD_REQUEST)
        );
      }

      await this.cartService.removeFromCart(sessionId, itemId);
      return res.status(HttpStatus.OK).json(
        this.success('Item removed from cart successfully', HttpStatus.OK)
      );
    } catch (error) {
      const status = error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(status).json(
        this.error('Failed to remove item from cart', status, error.message)
      );
    }
  }

  @Delete()
  @ApiOperation({ summary: 'Clear cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared successfully' })
  @ApiHeader({ name: 'x-session-id', description: 'User session ID', required: true })
  async clearCart(
    @Headers('x-session-id') sessionId: string,
    @Res() res: Response
  ) {
    try {
      if (!sessionId) {
        return res.status(HttpStatus.BAD_REQUEST).json(
          this.error('Session ID is required', HttpStatus.BAD_REQUEST)
        );
      }

      await this.cartService.clearCart(sessionId);
      return res.status(HttpStatus.OK).json(
        this.success('Cart cleared successfully', HttpStatus.OK)
      );
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
        this.error('Failed to clear cart', HttpStatus.INTERNAL_SERVER_ERROR, error.message)
      );
    }
  }

  @Get('count')
  @ApiOperation({ summary: 'Get cart item count' })
  @ApiResponse({ status: 200, description: 'Cart item count retrieved successfully' })
  @ApiHeader({ name: 'x-session-id', description: 'User session ID', required: true })
  async getCartItemCount(
    @Headers('x-session-id') sessionId: string,
    @Res() res: Response
  ) {
    try {
      if (!sessionId) {
        return res.status(HttpStatus.BAD_REQUEST).json(
          this.error('Session ID is required', HttpStatus.BAD_REQUEST)
        );
      }

      const count = await this.cartService.getCartItemCount(sessionId);
      return res.status(HttpStatus.OK).json(
        this.success('Cart item count retrieved successfully', HttpStatus.OK, { count })
      );
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
        this.error('Failed to retrieve cart item count', HttpStatus.INTERNAL_SERVER_ERROR, error.message)
      );
    }
  }

  @Get('total')
  @ApiOperation({ summary: 'Get cart total' })
  @ApiResponse({ status: 200, description: 'Cart total retrieved successfully' })
  @ApiHeader({ name: 'x-session-id', description: 'User session ID', required: true })
  async getCartTotal(
    @Headers('x-session-id') sessionId: string,
    @Res() res: Response
  ) {
    try {
      if (!sessionId) {
        return res.status(HttpStatus.BAD_REQUEST).json(
          this.error('Session ID is required', HttpStatus.BAD_REQUEST)
        );
      }

      const total = await this.cartService.getCartTotal(sessionId);
      return res.status(HttpStatus.OK).json(
        this.success('Cart total retrieved successfully', HttpStatus.OK, { total })
      );
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
        this.error('Failed to retrieve cart total', HttpStatus.INTERNAL_SERVER_ERROR, error.message)
      );
    }
  }

  @Post('session')
  @ApiOperation({ summary: 'Generate new session ID' })
  @ApiResponse({ status: 201, description: 'Session ID generated successfully' })
  async generateSessionId(@Res() res: Response) {
    try {
      const sessionId = this.cartService.generateSessionId();
      return res.status(HttpStatus.CREATED).json(
        this.success('Session ID generated successfully', HttpStatus.CREATED, { sessionId })
      );
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
        this.error('Failed to generate session ID', HttpStatus.INTERNAL_SERVER_ERROR, error.message)
      );
    }
  }
}
