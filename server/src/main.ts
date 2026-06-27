import 'reflect-metadata';
import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const isProd = process.env.NODE_ENV === 'production';

  // ── Trust reverse proxy (Nginx / Render / Railway) ─────────
  app.set('trust proxy', 1);

  // ── CORS ───────────────────────────────────────────────────
  // Build allowed list from env + hardcoded fallbacks so any
  // domain change only needs a server env-var update.
  const fromEnv = (process.env.FRONTEND_URL ?? '')
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean);

  const allowedOrigins = [
    ...fromEnv,
    // kosres.com
    'https://kosres.com',
    'https://www.kosres.com',
    // Vercel preview URLs
    /https:\/\/.*\.vercel\.app$/,
    // Render preview URLs
    /https:\/\/.*\.onrender\.com$/,
    // Local dev
    'http://localhost:3000',
    'http://localhost:3001',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow no-origin requests (Postman, curl, mobile apps)
      if (!origin) return callback(null, true);

      const allowed = allowedOrigins.some((o) =>
        typeof o === 'string' ? o === origin : o.test(origin),
      );

      if (allowed) return callback(null, true);
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ── Global prefix ───────────────────────────────────────────
  app.setGlobalPrefix('api');

  // ── Validation ──────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // ── Serialization ───────────────────────────────────────────
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // ── Swagger ─────────────────────────────────────────────────
  // Keep enabled so you can test the API; add auth if needed later
  const config = new DocumentBuilder()
    .setTitle('KOSRES API')
    .setDescription('Kigali One Stop Real Estate Service – REST API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // ── Listen ──────────────────────────────────────────────────
  // IMPORTANT: bind to 0.0.0.0 so Render / Railway can reach the process.
  // On Hetzner with Nginx, Nginx proxies to this port so 0.0.0.0 is fine.
  const port = process.env.PORT ?? 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 KOSRES API running on port ${port}`);
  console.log(`📚 Swagger docs at /api/docs`);
}
bootstrap();
