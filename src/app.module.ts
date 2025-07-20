import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_PIPE, APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './core/product/product.module';
import { CartModule } from './core/cart/cart.module';
import { AuthModule } from './core/auth/auth.module';
import { Product } from './core/product/entities/product.entity';
import { Category } from './core/product/entities/category.entity';
import { CartItem } from './core/cart/entities/cart.entity';
import { User } from './core/auth/entities/user.entity';
import { GlobalAuthGuard } from './core/auth/guards/global-auth.guard';
import { RolesGuard } from './core/auth/guards/roles.guard';

@Module({
  imports: [
    // Global configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    
    // SQLite database connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'sqlite',
        database: configService.get<string>('DATABASE_PATH') || 'database.sqlite',
        entities: [Product, Category, CartItem, User],
        synchronize: true, // Only for development
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    
    // Feature modules
    AuthModule,
    ProductModule,
    CartModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global validation pipe
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
    // Global authentication guard
    {
      provide: APP_GUARD,
      useClass: GlobalAuthGuard,
    },
    // Global roles guard
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
