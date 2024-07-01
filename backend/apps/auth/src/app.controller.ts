import { Controller, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { Ctx, MessagePattern, RmqContext } from '@nestjs/microservices';
import { SharedService } from '@app/common/services/shared.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('SharedServiceInterface')
    private readonly sharedService: SharedService,
  ) {}

  @MessagePattern({ cmd: 'auth' })
  getHello(@Ctx() context: RmqContext): string {
    this.sharedService.acknowledgeMessage(context);
    console.log('Received message');
    return this.appService.getHello();
  }
}
