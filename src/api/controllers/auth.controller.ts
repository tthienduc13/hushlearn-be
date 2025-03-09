import { Public } from '@shared/decorators/public.decorator';
import { Controller, Post } from '@nestjs/common';
import { AuthService } from '@application/services/auth.service';

@Controller('authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('test')
  @Public()
  test() {
    return this.authService.test();
  }

  @Post('test2')
  @Public()
  test2() {
    return this.authService.test();
  }
}
