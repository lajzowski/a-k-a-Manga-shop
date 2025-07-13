import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const user = await this.authService.validateUser(body.username, body.password);
    // Теперь возвращаем contract_id для авторов
    return {
      id: user.id,
      username: user.username,
      role: user.role,
      contract_id: user.contract_id ?? undefined,
    };
  }
} 