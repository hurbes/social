import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '@app/common';
import { UserRepository } from './repository/user.repository';

import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import {
  CreateUserRequest,
  ExistingUserRequest,
  UserResponse,
  userResponseSchema,
} from '@app/dto';
import { ClientProxy } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';
import { firstValueFrom } from 'rxjs';
@Injectable()
export class AppService {
  constructor(
    private readonly usersRepository: UserRepository,
    private readonly jwtService: JwtService,
    @Inject('CACHE_SERVICE') private readonly cacheService: ClientProxy,
  ) {}

  private readonly jwtExpiration = 1800; // 30 minutes
  private readonly refreshTokenExpiration = 1296000; // 15 days

  async getUsers(): Promise<UserResponse[]> {
    const result = await this.usersRepository.find({});
    return result.map((user) => userResponseSchema.parse(user));
  }

  async getUserById(id: string): Promise<UserResponse> {
    console.log('user-getUserById', id);
    const $cachedUser = this.cacheService.send({ cmd: 'get-user' }, id);
    const user = await firstValueFrom<UserResponse>($cachedUser);
    console.log('user-cached user', user);
    if (user) {
      return userResponseSchema.parse(user);
    }

    const result = await this.usersRepository.findOne({ _id: id });
    console.log('user-result', result);
    this.cacheService.send({ cmd: 'set-user' }, { ...result });
    return userResponseSchema.parse(result);
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({
      email: email,
    });
  }

  async createUser(
    user: Omit<CreateUserRequest, 'confirmPassword'>,
  ): Promise<UserResponse> {
    const result = await this.usersRepository.create(user as User);
    return userResponseSchema.parse(result);
  }

  async updateUser(id: number, user: User): Promise<UserResponse> {
    const result = await this.usersRepository.upsert({ _id: id }, user);
    return userResponseSchema.parse(result);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  private async createSession(
    userId: string,
  ): Promise<{ jwt: string; refreshToken: string }> {
    const sessionId = uuidv4();
    const jwt = await this.jwtService.signAsync(
      { userId, sessionId },
      { expiresIn: this.jwtExpiration },
    );
    const refreshToken = uuidv4();

    this.cacheService.send(
      { cmd: 'set-session' },
      { userId, sessionId, refreshToken, ttl: this.refreshTokenExpiration },
    );
    return { jwt, refreshToken };
  }

  async register(newUser: Readonly<CreateUserRequest>): Promise<UserResponse> {
    const { name, email, password } = newUser;
    const existingUser = await this.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('An account with that email already exists!');
    }

    const hashedPassword = await this.hashPassword(password);
    const savedUser = await this.createUser({
      name,
      email,
      password: hashedPassword,
    });

    return userResponseSchema.parse(savedUser);
  }

  async doesPasswordMatch(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.findByEmail(email);

    const doesUserExist = !!user;

    if (!doesUserExist) return null;

    const doesPasswordMatch = await this.doesPasswordMatch(
      password,
      user.password,
    );

    if (!doesPasswordMatch) return null;

    return user;
  }

  async getUserFromHeader(jwt: string): Promise<UserResponse> {
    if (!jwt) return;

    try {
      const { userId } = await this.jwtService.decode(jwt);

      console.log('userId', userId);
      return this.getUserById(userId);
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async login(
    existingUser: Readonly<ExistingUserRequest>,
  ): Promise<{ user: UserResponse; jwt: string; refreshToken: string }> {
    const { email, password } = existingUser;
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException();
    }

    const { jwt, refreshToken } = await this.createSession(user._id.toString());
    const userResponse = userResponseSchema.parse(user);

    return { user: userResponse, jwt, refreshToken };
  }

  async verifyJwt(
    jwt: string,
  ): Promise<{ userId: string; sessionId: string; exp: number }> {
    if (!jwt) {
      throw new UnauthorizedException();
    }

    try {
      const { userId, sessionId, exp } = this.jwtService.verify(jwt);
      return { userId, sessionId, exp };
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  async refreshJwt(
    userId: string,
    sessionId: string,
    refreshToken: string,
  ): Promise<{ jwt: string; refreshToken: string }> {
    const $session = this.cacheService.send(
      { cmd: 'get-session' },
      { userId, sessionId },
    );

    const session = await firstValueFrom($session);

    if (!session || session.refreshToken !== refreshToken) {
      throw new UnauthorizedException();
    }

    this.cacheService.send({ cmd: 'delete-session' }, { userId, sessionId });

    const newJwt = await this.jwtService.signAsync(
      { userId, sessionId },
      { expiresIn: this.jwtExpiration },
    );
    const newRefreshToken = uuidv4();

    this.cacheService.send(
      { cmd: 'set-session' },
      {
        userId,
        sessionId,
        refreshToken: newRefreshToken,
        ttl: this.refreshTokenExpiration,
      },
    );

    return { jwt: newJwt, refreshToken: newRefreshToken };
  }

  logout(response: Response) {
    response.cookie('Authentication', '', {
      httpOnly: true,
      expires: new Date(),
    });
  }
}
