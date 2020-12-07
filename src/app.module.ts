import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PingModule } from './ping/ping.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PingGeneratorService } from './ping/cron/ping.cron';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URI
    ),
    PingModule,
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, PingGeneratorService],
})
export class AppModule { }
