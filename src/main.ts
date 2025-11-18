import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MqttService } from './mqtt/mqtt.service';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidUnknownValues: false,
    }),
  );

  const mqttService = app.get(MqttService);

  await app.listen(8000);
  console.log(`🚀 App ready on port 8000`);
}

bootstrap();
