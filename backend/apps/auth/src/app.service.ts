import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User, UserJwt } from '@app/common';
import { UserRepository } from './repository/user.repository';

import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import {
  CreateUserRequest,
  ExistingUserRequest,
  UserResponse,
  userResponseSchema,
} from '@app/dto';

@Injectable()
export class AppService {
  constructor(
    private readonly usersRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async getUsers(): Promise<UserResponse[]> {
    const result = await this.usersRepository.find();
    return result.map((user) => userResponseSchema.parse(user));
  }

  async getUserById(id: string): Promise<UserResponse> {
    const result = await this.usersRepository.findOne({ _id: id });
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

  async getUserFromHeader(jwt: string): Promise<UserJwt> {
    if (!jwt) return;

    try {
      return this.jwtService.decode(jwt);
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async login(
    existingUser: Readonly<ExistingUserRequest>,
  ): Promise<{ user: UserResponse; jwt: string }> {
    const { email, password } = existingUser;
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException();
    }

    const jwt = await this.jwtService.signAsync({ user });
    const userResponse = userResponseSchema.parse(user);

    return { user: userResponse, jwt };
  }

  async verifyJwt(jwt: string): Promise<{ user: User; exp: number }> {
    if (!jwt) {
      throw new UnauthorizedException();
    }

    try {
      const { user, exp } = await this.jwtService.verifyAsync(jwt);
      return { user, exp };
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  logout(response: Response) {
    response.cookie('Authentication', '', {
      httpOnly: true,
      expires: new Date(),
    });
  }
}
