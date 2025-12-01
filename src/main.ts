import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { MqttService } from './mqtt/mqtt.service';

async function bootstrap() {
  // Create Nest App
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Load ENV variables
  const port = config.get<number>('APP_PORT') ?? 8000;

  // FRONTEND_URL wajib HTTPS, contoh:
  // FRONTEND_URL=https://b3sahabat.cloud
  const frontendUrl = config.get<string>('FRONTEND_URL') ?? '*';

  console.log('🟦 FRONTEND_URL loaded:', frontendUrl);

  // ============================
  // ✅ CORS CONFIGURATION
  // ============================
  app.enableCors({
    origin: (origin, callback) => {
      // Allow direct HTTPS frontend calls
      if (!origin || origin === frontendUrl) {
        return callback(null, true);
      }
      console.warn('❌ Blocked by CORS:', origin);
      return callback(new Error('Not allowed by CORS'), false);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: '*',
    credentials: true,
  });

  // ============================
  // 🌍 GLOBAL VALIDATION
  // ============================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidUnknownValues: false,
    }),
  );

  // ============================
  // 📘 SWAGGER DOCUMENTATION
  // ============================
  const swaggerCfg = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('REST API for your system')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerCfg);
  SwaggerModule.setup('docs', app, document);

  // ============================
  // 🔌 MQTT (Optional)
  // ============================
  const mqttService = app.get(MqttService);
  // mqttService.connect();

  // ============================
  // 🚀 START SERVER
  // ============================
  await app.listen(port, '0.0.0.0'); // IMPORTANT for Cloudflare Tunnel
  console.log(`🚀 Backend running on port ${port}`);
  console.log(`🌐 CORS Allowed Origin: ${frontendUrl}`);
  console.log(`📘 Swagger: http://localhost:${port}/docs`);
}

bootstrap();
