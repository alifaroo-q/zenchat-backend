import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomConfigModule } from './config/config.module';
import { PostgreSQLConfig } from './config/database/orm.config';
import { AuthModule } from './module/core/auth/auth.module';
import { ChatModule } from './module/feature/chat/chat.module';
import { MessageModule } from './module/feature/message/message.module';
import { RoomModule } from './module/feature/room/room.module';
import { UserModule } from './module/feature/user/user.module';

@Module({
  imports: [
    CustomConfigModule,
    TypeOrmModule.forRootAsync(PostgreSQLConfig),
    AuthModule,
    UserModule,
    ChatModule,
    RoomModule,
    MessageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
