import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { kafkaConfig } from './kafka.config';
import { KafkaModule } from './kafka/kafka.module';


async function bootstrap() {
  const kafkaApp = await NestFactory.createMicroservice<MicroserviceOptions>(KafkaModule, kafkaConfig);
  kafkaApp.listen(() => console.log('Ping Service Running'));
}
bootstrap();
