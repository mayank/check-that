import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Cron, CronExpression, Timeout } from "@nestjs/schedule";
import { PingService } from "../ping.service";
import { ServiceDocument } from "../model/service.model";
import { Client, ClientKafka } from "@nestjs/microservices";
import { kafkaConfig } from '../../kafka.config';
import { PingConsumerTopic } from "src/kafka/kafka.model";
@Injectable()
export class PingGeneratorService implements OnModuleInit {
    private readonly logger = new Logger(PingGeneratorService.name);

    @Client(kafkaConfig)
    private readonly kafka: ClientKafka;

    async onModuleInit() {
        this.kafka.subscribeToResponseOf(PingConsumerTopic);
        await this.kafka.connect();
    }

    constructor(
        private readonly pingService: PingService,
    ) {}

    @Cron(CronExpression.EVERY_SECOND)
    @Timeout(500)
    async handleCron() {
        const services: ServiceDocument[] = await this.pingService.getNextWatchlist();
        for(const service of services) {
            await this.kafka.emit(PingConsumerTopic, JSON.stringify(service));
        }
    }
}