import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { UserRepository } from '../repository/user.repository';
import { User, UserRole } from '../entities/user.entity';
import { JwtPayload } from '../dto/auth.dto';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let userRepository: UserRepository;
  let configService: ConfigService;

  const mockUserRepository = {
    findById: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    userRepository = module.get<UserRepository>(UserRepository);
    configService = module.get<ConfigService>(ConfigService);

    // Clear all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    const payload: JwtPayload = {
      sub: 'user-id',
      email: 'test@example.com',
      role: UserRole.USER,
      firstName: 'Test',
      lastName: 'User',
    };

    it('should return user data when user exists and is active', async () => {
      const user = {
        id: 'user-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.USER,
        isActive: true,
      } as User;

      mockUserRepository.findById.mockResolvedValue(user);

      const result = await strategy.validate(payload);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(payload.sub);
      expect(result).toEqual({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(payload.sub);
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      const user = {
        id: 'user-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.USER,
        isActive: false,
      } as User;

      mockUserRepository.findById.mockResolvedValue(user);

      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(payload.sub);
    });

    it('should work with admin user', async () => {
      const adminPayload: JwtPayload = {
        sub: 'admin-id',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
        firstName: 'Admin',
        lastName: 'User',
      };

      const adminUser = {
        id: 'admin-id',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        isActive: true,
      } as User;

      mockUserRepository.findById.mockResolvedValue(adminUser);

      const result = await strategy.validate(adminPayload);

      expect(result).toEqual({
        id: adminUser.id,
        email: adminUser.email,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        role: adminUser.role,
      });
    });
  });
});
