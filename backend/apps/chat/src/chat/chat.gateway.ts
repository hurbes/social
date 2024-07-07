import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { firstValueFrom } from 'rxjs';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ transport: ['websocket'], cors: true, cookie: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
  ) {}

  @WebSocketServer()
  server: Server;

  handleDisconnect() {
    console.log('DISCONNECTED');
  }

  async handleConnection(client: Socket) {
    // console.log('CONNECTED');
    // const cookies = client.request.headers;
    // console.log('COOKIES', cookies);
    // if (!cookies) {
    //   client.emit('error', 'Unauthorized');
    //   this.server.disconnectSockets(true);
    // }
    // const authHeaderParts = (cookies as string).split('=');
    // if (authHeaderParts.length !== 2) {
    //   client.emit('error', 'Unauthorized');
    //   this.server.disconnectSockets(true);
    // }
    // const cookie = authHeaderParts[1];
    // const $res = this.authService.send({ cmd: 'verify-jwt' }, { cookie });
    // try {
    //   const user = await firstValueFrom($res);
    //   console.error('USER', user);
    //   client.to(client.id).emit('authorized', user);
    // } catch (error) {
    //   console.error(error);
    //   client.emit('error', error);
    //   this.server.disconnectSockets(true);
    // }
  }

  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, payload: string): void {
    this.server.to(client.id).emit('msgToClient', payload);
  }
}
