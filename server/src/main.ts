import 'reflect-metadata';
import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const isProd = process.env.NODE_ENV === 'production';

  // ── Trust Nginx reverse proxy ──────────────────────────────
  // Required on Hetzner so req.ip / X-Forwarded-For work correctly
  app.set('trust proxy', 1);

  // ── CORS ──────────────────────────────────────────────────
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL,         // e.g. https://www.kosres.rw
    'https://kosres.rw',
    'https://www.kosres.rw',
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Swagger, mobile)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        (!isProd && origin.startsWith('http://localhost'))
      ) {
        return callback(null, true);
      }
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ── Global prefix ──────────────────────────────────────────
  app.setGlobalPrefix('api');

  // ── Validation ─────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // ── Serialization ──────────────────────────────────────────
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // ── Swagger (disable in production for security) ───────────
  if (!isProd) {
    const config = new DocumentBuilder()
      .setTitle('KOSRES API')
      .setDescription('Kigali One Stop Real Estate Service – REST API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    console.log(`📚 Swagger docs at http://localhost:${process.env.PORT || 3001}/api/docs`);
  }

  const port = process.env.PORT || 3001;
  await app.listen(port, '127.0.0.1'); // bind to localhost only — Nginx handles public traffic
  console.log(`🚀 KOSRES API running on http://127.0.0.1:${port}/api`);
  if (isProd) console.log(`🌍 Public URL: ${process.env.FRONTEND_URL?.replace('www.', 'api.')}/api`);
}
bootstrap();
