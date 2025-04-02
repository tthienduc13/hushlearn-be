import { Public } from '@shared/decorators/public.decorator';
import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('authentication')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('test123')
  @Public()
  test() {
    return this.authService.test();
  }

  @Post('test2')
  @Public()
  test2() {
    return this.authService.test();
  }

  @Post('test3')
  @Public()
  test3() {
    return this.authService.test();
  }
}
