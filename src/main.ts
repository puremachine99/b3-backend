import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MqttService } from './mqtt/mqtt.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const mqttService = app.get(MqttService);

  await app.listen(8000);
  console.log(`🚀 App ready on port 8000`);

  // test publish
  setTimeout(() => {
    mqttService.publishCommand('A47221B7B3F8', 'TEST');
  }, 3000);
}
bootstrap();
