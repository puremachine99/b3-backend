import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MqttService } from './mqtt/mqtt.service';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS
  app.enableCors({
    // origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    origin: ['http://api.b3sahabat.cloud', 'http://127.0.0.1:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidUnknownValues: false,
    }),
  );

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('REST API for your system')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Init MQTT
  const mqttService = app.get(MqttService);
  // optional: mqttService.connect(); if you have manual connect()

  await app.listen(8000);
  console.log(`🚀 Server running on http://localhost:8000`);
  console.log(`📘 Swagger UI available at http://localhost:8000/docs`);
}

bootstrap();
