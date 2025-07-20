import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRepository } from './repository/user.repository';
import { User, UserRole } from './entities/user.entity';

// Mock bcrypt with proper typing
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';
const mockBcrypt = bcrypt as any;

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: UserRepository;
  let jwtService: JwtService;

  const mockUserRepository = {
    findByEmail: jest.fn(),
    findActiveByEmail: jest.fn(),
    create: jest.fn(),
    updateLastLogin: jest.fn(),
    findById: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);
    jwtService = module.get<JwtService>(JwtService);

    // Clear all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.USER,
    };

    it('should register a new user successfully', async () => {
      const hashedPassword = 'hashedPassword123';
      const createdUser = {
        id: 'user-id',
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        role: registerDto.role,
        password: hashedPassword,
      } as User;

      const accessToken = 'jwt-token';

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockBcrypt.hash.mockResolvedValue(hashedPassword);
      mockUserRepository.create.mockResolvedValue(createdUser);
      mockJwtService.sign.mockReturnValue(accessToken);

      const result = await service.register(registerDto);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(mockBcrypt.hash).toHaveBeenCalledWith(registerDto.password, 12);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        role: registerDto.role,
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: createdUser.id,
        email: createdUser.email,
        role: createdUser.role,
        firstName: createdUser.firstName,
        lastName: createdUser.lastName,
      });
      expect(result).toEqual({
        accessToken,
        user: {
          id: createdUser.id,
          email: createdUser.email,
          firstName: createdUser.firstName,
          lastName: createdUser.lastName,
          role: createdUser.role,
        },
      });
    });

    it('should throw ConflictException when user already exists', async () => {
      const existingUser = { id: 'existing-user', email: registerDto.email } as User;
      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(mockBcrypt.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should default to USER role when no role is provided', async () => {
      const registerDtoWithoutRole = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      const hashedPassword = 'hashedPassword123';
      const createdUser = {
        id: 'user-id',
        email: registerDtoWithoutRole.email,
        firstName: registerDtoWithoutRole.firstName,
        lastName: registerDtoWithoutRole.lastName,
        role: UserRole.USER,
        password: hashedPassword,
      } as User;

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockBcrypt.hash.mockResolvedValue(hashedPassword);
      mockUserRepository.create.mockResolvedValue(createdUser);
      mockJwtService.sign.mockReturnValue('jwt-token');

      await service.register(registerDtoWithoutRole);

      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: registerDtoWithoutRole.email,
        password: hashedPassword,
        firstName: registerDtoWithoutRole.firstName,
        lastName: registerDtoWithoutRole.lastName,
        role: UserRole.USER,
      });
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user successfully', async () => {
      const user = {
        id: 'user-id',
        email: loginDto.email,
        password: 'hashedPassword',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.USER,
        isActive: true,
      } as User;

      const accessToken = 'jwt-token';

      mockUserRepository.findActiveByEmail.mockResolvedValue(user);
      mockBcrypt.compare.mockResolvedValue(true);
      mockUserRepository.updateLastLogin.mockResolvedValue(undefined);
      mockJwtService.sign.mockReturnValue(accessToken);

      const result = await service.login(loginDto);

      expect(mockUserRepository.findActiveByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(mockBcrypt.compare).toHaveBeenCalledWith(loginDto.password, user.password);
      expect(mockUserRepository.updateLastLogin).toHaveBeenCalledWith(user.id);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      });
      expect(result).toEqual({
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUserRepository.findActiveByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(mockUserRepository.findActiveByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(mockBcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const user = {
        id: 'user-id',
        email: loginDto.email,
        password: 'hashedPassword',
        isActive: true,
      } as User;

      mockUserRepository.findActiveByEmail.mockResolvedValue(user);
      mockBcrypt.compare.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(mockUserRepository.findActiveByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(mockBcrypt.compare).toHaveBeenCalledWith(loginDto.password, user.password);
      expect(mockUserRepository.updateLastLogin).not.toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    const email = 'test@example.com';
    const password = 'password123';

    it('should return user data when credentials are valid', async () => {
      const user = {
        id: 'user-id',
        email,
        password: 'hashedPassword',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.USER,
        isActive: true,
      } as User;

      mockUserRepository.findActiveByEmail.mockResolvedValue(user);
      mockBcrypt.compare.mockResolvedValue(true);

      const result = await service.validateUser(email, password);

      expect(mockUserRepository.findActiveByEmail).toHaveBeenCalledWith(email);
      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, user.password);
      expect(result).toEqual({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
      });
    });

    it('should return null when user not found', async () => {
      mockUserRepository.findActiveByEmail.mockResolvedValue(null);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
      expect(mockBcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null when password is invalid', async () => {
      const user = { id: 'user-id', email, password: 'hashedPassword' } as User;
      mockUserRepository.findActiveByEmail.mockResolvedValue(user);
      mockBcrypt.compare.mockResolvedValue(false);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, user.password);
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const user = { id: 'user-id', email: 'test@example.com' } as User;
      mockUserRepository.findById.mockResolvedValue(user);

      const result = await service.findById('user-id');

      expect(result).toEqual(user);
      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-id');
    });

    it('should return null when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const result = await service.findById('user-id');

      expect(result).toBeNull();
      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-id');
    });
  });
});
