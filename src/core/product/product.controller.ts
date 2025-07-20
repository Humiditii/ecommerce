import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto/product.dto';
import { AppResponse } from '../../common/appResponse.parser';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  private success = AppResponse.success;
  private error = AppResponse.error;

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  async create(@Body() createProductDto: CreateProductDto, @Res() res: Response) {
    try {
      const product = await this.productService.createProduct(createProductDto);
      return res.status(HttpStatus.CREATED).json(
        this.success('Product created successfully', HttpStatus.CREATED, product)
      );
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(
        this.error('Failed to create product', HttpStatus.BAD_REQUEST, error.message)
      );
    }
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all products with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'brand', required: false, type: String })
  @ApiQuery({ name: 'color', required: false, type: String })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  async findAll(@Query() queryDto: ProductQueryDto, @Res() res: Response) {
    try {
      const result = await this.productService.findAllProducts(queryDto);
      return res.status(HttpStatus.OK).json(
        this.success('Products retrieved successfully', HttpStatus.OK, result.data, {
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
          },
        })
      );
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
        this.error('Failed to retrieve products', HttpStatus.INTERNAL_SERVER_ERROR, error.message)
      );
    }
  }

  @Public()
  @Get('featured')
  @ApiOperation({ summary: 'Get featured products' })
  @ApiResponse({ status: 200, description: 'Featured products retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findFeatured(@Query('limit') limit: number = 10, @Res() res: Response) {
    try {
      const products = await this.productService.findFeaturedProducts(limit);
      return res.status(HttpStatus.OK).json(
        this.success('Featured products retrieved successfully', HttpStatus.OK, products)
      );
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
        this.error('Failed to retrieve featured products', HttpStatus.INTERNAL_SERVER_ERROR, error.message)
      );
    }
  }

  @Public()
  @Get('sale')
  @ApiOperation({ summary: 'Get products on sale' })
  @ApiResponse({ status: 200, description: 'Sale products retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findSale(@Query('limit') limit: number = 10, @Res() res: Response) {
    try {
      const products = await this.productService.findSaleProducts(limit);
      return res.status(HttpStatus.OK).json(
        this.success('Sale products retrieved successfully', HttpStatus.OK, products)
      );
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
        this.error('Failed to retrieve sale products', HttpStatus.INTERNAL_SERVER_ERROR, error.message)
      );
    }
  }

  @Public()
  @Get('search')
  @ApiOperation({ summary: 'Search products' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async search(@Query('q') searchTerm: string, @Query('limit') limit: number = 10, @Res() res: Response) {
    try {
      const products = await this.productService.searchProducts(searchTerm, limit);
      return res.status(HttpStatus.OK).json(
        this.success('Search results retrieved successfully', HttpStatus.OK, products)
      );
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
        this.error('Failed to search products', HttpStatus.INTERNAL_SERVER_ERROR, error.message)
      );
    }
  }

  @Public()
  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get products by category' })
  @ApiResponse({ status: 200, description: 'Products by category retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findByCategory(
    @Param('categoryId') categoryId: string,
    @Query('limit') limit: number = 10,
    @Res() res: Response
  ) {
    try {
      const products = await this.productService.findProductsByCategory(categoryId, limit);
      return res.status(HttpStatus.OK).json(
        this.success('Products by category retrieved successfully', HttpStatus.OK, products)
      );
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
        this.error('Failed to retrieve products by category', HttpStatus.INTERNAL_SERVER_ERROR, error.message)
      );
    }
  }

  @Public()
  @Get('brand/:brand')
  @ApiOperation({ summary: 'Get products by brand' })
  @ApiResponse({ status: 200, description: 'Products by brand retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findByBrand(
    @Param('brand') brand: string,
    @Query('limit') limit: number = 10,
    @Res() res: Response
  ) {
    try {
      const products = await this.productService.findProductsByBrand(brand, limit);
      return res.status(HttpStatus.OK).json(
        this.success('Products by brand retrieved successfully', HttpStatus.OK, products)
      );
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
        this.error('Failed to retrieve products by brand', HttpStatus.INTERNAL_SERVER_ERROR, error.message)
      );
    }
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id') id: string, @Res() res: Response) {
    try {
      const product = await this.productService.findProductById(id);
      return res.status(HttpStatus.OK).json(
        this.success('Product retrieved successfully', HttpStatus.OK, product)
      );
    } catch (error) {
      const status = error.message === 'Product not found' ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(status).json(
        this.error('Failed to retrieve product', status, error.message)
      );
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Res() res: Response) {
    try {
      const product = await this.productService.updateProduct(id, updateProductDto);
      return res.status(HttpStatus.OK).json(
        this.success('Product updated successfully', HttpStatus.OK, product)
      );
    } catch (error) {
      const status = error.message === 'Product not found' ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST;
      return res.status(status).json(
        this.error('Failed to update product', status, error.message)
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  async remove(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.productService.deleteProduct(id);
      return res.status(HttpStatus.OK).json(
        this.success('Product deleted successfully', HttpStatus.OK)
      );
    } catch (error) {
      const status = error.message === 'Product not found' ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(status).json(
        this.error('Failed to delete product', status, error.message)
      );
    }
  }
}
