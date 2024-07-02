import { Controller, Inject, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { SharedService } from '@app/common/services/shared.service';
import { ExistingUserRequest } from './dto/existing_user_dto';
import { CreateUserRequest } from './dto/create-user.dto';
import { JwtGuard } from './guard/jwt.guard';
import { User } from '@app/common';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('SharedServiceInterface')
    private readonly sharedService: SharedService,
  ) {}

  @MessagePattern({ cmd: 'get-users' })
  async getUsers(@Ctx() context: RmqContext) {
    this.sharedService.acknowledgeMessage(context);

    return this.appService.getUsers();
  }

  @MessagePattern({ cmd: 'register' })
  async register(
    @Ctx() context: RmqContext,
    @Payload() newUser: CreateUserRequest,
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.appService.register(newUser);
  }

  @MessagePattern({ cmd: 'login' })
  async login(
    @Ctx() context: RmqContext,
    @Payload() existingUser: ExistingUserRequest,
  ): Promise<{ user: User; jwt: string }> {
    this.sharedService.acknowledgeMessage(context);

    return this.appService.login(existingUser);
  }

  @MessagePattern({ cmd: 'verify-jwt' })
  @UseGuards(JwtGuard)
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
    @Payload() user: { id: number },
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.appService.getUserById(user.id);
  }
}
