import { KafkaOptions, Transport } from "@nestjs/microservices";
import { logLevel } from "@nestjs/microservices/external/kafka-options.interface";

export const kafkaConfig: KafkaOptions = {
    transport: Transport.KAFKA,
    options: {
        client: {
            clientId: `ping-consumer-${Math.floor(Math.random() * 100000)}`,
            brokers: [process.env.KAFKA_BROKER],
            logLevel: logLevel.INFO,
        },
        producer: {
            allowAutoTopicCreation: true,
        },
        consumer: {
            groupId: 'ping-consumer',
        },
    }
};