import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PingModule } from 'src/ping/ping.module';
import { PingService } from 'src/ping/ping.service';
import { KafkaController } from './kafka.controller';

@Module({
    imports: [
        MongooseModule.forRoot(
            process.env.MONGO_URI
        ),
        PingModule,
    ],
    controllers: [KafkaController],
})
export class KafkaModule { }
