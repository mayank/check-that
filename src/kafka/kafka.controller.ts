import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { PingService } from "src/ping/ping.service";
import { PingConsumerTopic } from "./kafka.model";


@Controller()
export class KafkaController {

    constructor(
        private readonly pingService: PingService,
    ) {}

    @EventPattern(PingConsumerTopic)
    async processMessage(@Payload() message) {
        await this.pingService.createNewHttpPing(message.value);
        return {};
    }

}