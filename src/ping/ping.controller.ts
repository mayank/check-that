import { Controller, Post, Body, Get } from '@nestjs/common';
import { PingService } from './ping.service';
import { AddServiceDTO } from './dto/add-service.dto';
import { GetServiceMetricsDTO } from './dto/get-service-info.dto';

@Controller('service')
export class PingController {

    constructor(
        private readonly pingService: PingService,
    ) {}

    @Post('add')
    registerNewService(@Body() serviceInfo: AddServiceDTO) {
        return this.pingService.createNewService(serviceInfo);
    }

    @Get()
    getAllServices() {
        return this.pingService.getServices();
    }

    @Post('info')
    getServiceMetrics(@Body() serviceInfo: GetServiceMetricsDTO) {
        return this.pingService.getServiceMetrics(serviceInfo);
    }

}
