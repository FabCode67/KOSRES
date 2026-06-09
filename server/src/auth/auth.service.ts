import {
  Injectable, UnauthorizedException, ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../users/user.entity';
import { LoginDto, RegisterDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    if (!user.isActive) throw new UnauthorizedException('Account disabled');

    const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
    return {
      access_token: token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }

  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      name: dto.name,
      email: dto.email,
      password: hashed,
      role: UserRole.AGENT,
    });
    await this.userRepo.save(user);
    const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
    return {
      access_token: token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }

  async me(userId: string) {
    return this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'name', 'email', 'role', 'createdAt'],
    });
  }
}
