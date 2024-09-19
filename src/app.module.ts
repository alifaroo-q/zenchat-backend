import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomConfigModule } from './config/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostgreSQLConfig } from './config/database/orm.config';
import { AuthModule } from './module/core/auth/auth.module';
import { UserModule } from './module/feature/user/user.module';
import { ChatModule } from './module/feature/chat/chat.module';

@Module({
  imports: [
    CustomConfigModule,
    TypeOrmModule.forRootAsync(PostgreSQLConfig),
    AuthModule,
    UserModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
