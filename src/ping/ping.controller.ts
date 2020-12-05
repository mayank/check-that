import { Controller, Post, Body, Get } from '@nestjs/common';
import { PingService } from './ping.service';
import { AddServiceDTO } from './dto/add-service.dto';

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

}
