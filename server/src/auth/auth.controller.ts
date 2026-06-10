import { Controller, Post, Get, Body, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './auth.dto';
import { Public } from './public.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('auth')
@UseGuards(JwtAuthGuard)
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Admin / Agent login' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register new agent' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user info' })
  me(@Request() req: any) {
    return this.authService.me(req.user.id);
  }

  /** Quick endpoint to verify a token is valid */
  @Get('verify')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify token is valid' })
  verify(@Request() req: any) {
    return {
      valid: true,
      user: {
        id:    req.user.id,
        email: req.user.email,
        role:  req.user.role,
      },
    };
  }
}
