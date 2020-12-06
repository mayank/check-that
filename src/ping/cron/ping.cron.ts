import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression, Timeout } from "@nestjs/schedule";
import { PingService } from "../ping.service";
import { ServiceDocument } from "../model/service.model";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { PingGeneratorEvent } from "../model/generator.event";

@Injectable()
export class PingGeneratorService {
    private readonly logger = new Logger(PingGeneratorService.name);

    constructor(
        private readonly pingService: PingService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    // @Cron(CronExpression.EVERY_SECOND)
    @Timeout(500)
    async handleCron() {
        const services: ServiceDocument[] = await this.pingService.getNextWatchlist();
        for(const service of services) {
            this.eventEmitter.emitAsync('ping.http.create', new PingGeneratorEvent(service));
        }
    }
}