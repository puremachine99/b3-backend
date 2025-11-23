import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { MqttService } from './mqtt/mqtt.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  const port = config.get<number>('APP_PORT') ?? 8000;
  const frontendUrl = config.get<string>('FRONTEND_URL') ?? '*';

  // =====================
  // ✅ CORS (dynamic from .env)
  // =====================
  app.enableCors({
    origin: frontendUrl,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: '*',
    credentials: true,
  });

  // =====================
  // 🔧 GLOBAL VALIDATION
  // =====================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidUnknownValues: false,
    }),
  );

  // =====================
  // 📘 SWAGGER
  // =====================
  const swaggerCfg = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('REST API for your system')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerCfg);
  SwaggerModule.setup('docs', app, document);

  // =====================
  // 🔌 MQTT (optional)
  // =====================
  const mqttService = app.get(MqttService);
  // mqttService.connect(); // uncomment optional

  // =====================
  // 🚀 START
  // =====================
  await app.listen(port);

  console.log(`🚀 Server running on port ${port}`);
  console.log(`🌐 CORS allowed origin: ${frontendUrl}`);
  console.log(`📘 Swagger: http://localhost:${port}/docs`);
}

bootstrap();
