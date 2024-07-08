import { Controller, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { SharedService } from '@app/common/services/shared.service';

import {
  author,
  CreateUserRequest,
  ExistingUserRequest,
  UserResponse,
} from '@app/dto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('SharedServiceInterface')
    private readonly sharedService: SharedService,
  ) {}

  @MessagePattern({ cmd: 'get-users' })
  async getUsers(@Ctx() context: RmqContext): Promise<UserResponse[]> {
    this.sharedService.acknowledgeMessage(context);

    return this.appService.getUsers();
  }

  @MessagePattern({ cmd: 'register' })
  async register(
    @Ctx() context: RmqContext,
    @Payload() newUser: CreateUserRequest,
  ): Promise<UserResponse> {
    this.sharedService.acknowledgeMessage(context);

    return this.appService.register(newUser);
  }

  @MessagePattern({ cmd: 'login' })
  async login(
    @Ctx() context: RmqContext,
    @Payload() existingUser: ExistingUserRequest,
  ): Promise<{ user: UserResponse; jwt: string }> {
    this.sharedService.acknowledgeMessage(context);

    return this.appService.login(existingUser);
  }
  @MessagePattern({ cmd: 'decode-jwt' })
  async decodeJwt(
    @Ctx() context: RmqContext,
    @Payload() payload: { cookie: string },
  ) {
    this.sharedService.acknowledgeMessage(context);

    const res = await this.appService.getUserFromHeader(payload.cookie);
    console.log('decodeJwt', res);
    return author.parse(res);
  }

  @MessagePattern({ cmd: 'verify-jwt' })
  async verifyJwt(
    @Ctx() context: RmqContext,
    @Payload() payload: { cookie: string },
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.appService.verifyJwt(payload.cookie);
  }

  @MessagePattern({ cmd: 'get-user' })
  async getUserById(
    @Ctx() context: RmqContext,
    @Payload() user: { id: string },
  ): Promise<UserResponse> {
    console.log('getUserById', user);
    this.sharedService.acknowledgeMessage(context);

    return this.appService.getUserById(user.id);
  }
}
