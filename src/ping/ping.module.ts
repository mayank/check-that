import { Module, HttpService } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpServiceSchema, HttpServiceModel, ServiceSchema, ServiceModel } from './model/service.model';
import { PingController } from './ping.controller';
import { PingService } from './ping.service';
import { PingGeneratorService } from './cron/ping.cron';
import { ResultModel, ResultSchema } from './model/result.model';

@Module({
    imports: [
        MongooseModule.forFeature(
            [
                {
                    name: ServiceModel.name,
                    schema: ServiceSchema,
                },
                {
                    name: HttpServiceModel.name,
                    schema: HttpServiceSchema,
                },
                {
                    name: ResultModel.name,
                    schema: ResultSchema,
                },
            ]
        )
    ],
    controllers: [PingController],
    providers: [PingService, PingGeneratorService]
})
export class PingModule {}
