import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as mongoose from 'mongoose';
// mongoose.set('debug', true);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
  }));
  app.enableCors({ origin: true });
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
