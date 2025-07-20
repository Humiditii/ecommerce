import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsNumber, 
  IsUUID,
  Min,
  Max
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({ description: 'Product ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'Quantity to add', example: 1 })
  @IsNumber()
  @Min(1)
  @Max(100)
  quantity: number;

  @ApiPropertyOptional({ description: 'Selected size', example: '7' })
  @IsOptional()
  @IsString()
  selectedSize?: string;

  @ApiPropertyOptional({ description: 'Selected color', example: 'Red' })
  @IsOptional()
  @IsString()
  selectedColor?: string;
}

export class UpdateCartItemDto {
  @ApiProperty({ description: 'New quantity', example: 2 })
  @IsNumber()
  @Min(1)
  @Max(100)
  quantity: number;

  @ApiPropertyOptional({ description: 'Selected size', example: '7.5' })
  @IsOptional()
  @IsString()
  selectedSize?: string;

  @ApiPropertyOptional({ description: 'Selected color', example: 'Blue' })
  @IsOptional()
  @IsString()
  selectedColor?: string;
}

export class CartSummaryDto {
  @ApiProperty({ description: 'Total number of items', example: 3 })
  totalItems: number;

  @ApiProperty({ description: 'Subtotal amount', example: 898.29 })
  subtotal: number;

  @ApiProperty({ description: 'Shipping cost', example: 40.00 })
  shipping: number;

  @ApiProperty({ description: 'Import charges', example: 128.00 })
  importCharges: number;

  @ApiProperty({ description: 'Total amount', example: 1066.29 })
  total: number;

  @ApiProperty({ description: 'Cart items' })
  items: CartItemResponseDto[];
}

export class CartItemResponseDto {
  @ApiProperty({ description: 'Cart item ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ description: 'Product ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  productId: string;

  @ApiProperty({ description: 'Product name', example: 'New Balance Navy Blue' })
  productName: string;

  @ApiProperty({ description: 'Product image URL', example: 'https://example.com/shoe.jpg' })
  productImage: string;

  @ApiProperty({ description: 'Product brand', example: 'New Balance' })
  productBrand: string;

  @ApiProperty({ description: 'Product model', example: 'Air 570' })
  productModel: string;

  @ApiProperty({ description: 'Item quantity', example: 1 })
  quantity: number;

  @ApiProperty({ description: 'Unit price', example: 299.43 })
  price: number;

  @ApiProperty({ description: 'Total price for this item', example: 299.43 })
  totalPrice: number;

  @ApiPropertyOptional({ description: 'Selected size', example: '7' })
  selectedSize?: string;

  @ApiPropertyOptional({ description: 'Selected color', example: 'Navy Blue' })
  selectedColor?: string;

  @ApiProperty({ description: 'Date added to cart' })
  createdAt: Date;

  @ApiProperty({ description: 'Last updated date' })
  updatedAt: Date;
}
