import { Module } from '@nestjs/common';
import { ThrottleModule } from '@shared/modules/throttle.module';
import { LoggerModule } from '@shared/modules/logger.module';
import { AuthModule } from '@api/modules/auth.module';

@Module({
  providers: [],
  imports: [ThrottleModule, LoggerModule, AuthModule],
})
export class AppModule {}
