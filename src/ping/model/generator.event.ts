import { ServiceModel, ServiceDocument } from "./service.model";

export class PingGeneratorEvent {
    service: ServiceDocument;

    constructor(service: ServiceDocument) {
        this.service = service;
    }
}