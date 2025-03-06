import { AuthService } from '@/application/services/auth.service';
import { Module } from '@nestjs/common';
import { AuthController } from '@api/controllers/auth.controller';

@Module({
  imports: [],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
