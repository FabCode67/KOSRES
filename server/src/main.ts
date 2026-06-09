import 'reflect-metadata';
import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ── CORS ──
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    credentials: true,
  });

  // ── Global prefix ──
  app.setGlobalPrefix('api');

  // ── Validation ──
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // ── Serialization (exclude @Exclude fields like passwords) ──
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // ── Static files (uploaded images) ──
  app.useStaticAssets(join(process.cwd(), '..', 'client', 'public'), {
    prefix: '/static',
  });

  // ── Swagger ──
  const config = new DocumentBuilder()
    .setTitle('KOSRES API')
    .setDescription('Kigali One Stop Real Estate Service – REST API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 KOSRES API running on http://localhost:${port}/api`);
  console.log(`📚 Swagger docs at  http://localhost:${port}/api/docs`);
}
bootstrap();
