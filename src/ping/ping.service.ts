import { Injectable } from '@nestjs/common';
import { AddServiceDTO } from './dto/add-service.dto';
import { Model } from 'mongoose';
import { ServiceModel, HttpServiceModel, ServiceDocument, HttpServiceDocument } from './model/service.model';
import { InjectModel } from '@nestjs/mongoose';
import { OnEvent } from '@nestjs/event-emitter';
import { PingGeneratorEvent } from './model/generator.event';
import axios from 'axios';
import { ResultDocument, ResultModel, ResultStatus } from './model/result.model';
import { GetServiceMetricsDTO } from './dto/get-service-info.dto';
import moment from 'moment';

@Injectable()
export class PingService {

    constructor(
        @InjectModel(ServiceModel.name) private readonly serviceModel: Model<ServiceDocument>,
        @InjectModel(HttpServiceModel.name) private readonly httpServiceModel: Model<HttpServiceDocument>,
        @InjectModel(ResultModel.name) private readonly resultModel: Model<ResultDocument>,
    ) {}

    async createNewService(serviceInfo: AddServiceDTO) {
        const httpServiceModel: HttpServiceDocument = new this.httpServiceModel({
            ...serviceInfo.query,
        });
        await httpServiceModel.save();

        const serviceModel: ServiceDocument = new this.serviceModel({
            name: serviceInfo.name,
            query: httpServiceModel,
            nextWatch: Date(),
        });
        await serviceModel.save();

        return serviceModel;
    }

    async getServices() {
        return this.serviceModel.find({}, { name: 1 });
    }

    async getNextWatchlist() {
        return this.serviceModel.find()
        .where('nextWatch').lte(Date())
        .populate('query');
    }

    @OnEvent('ping.http.create', { async: true })
    async createNewHttpPing(payload: PingGeneratorEvent) {
        const result = new this.resultModel({
            service: payload.service,
        });

        try {
            const startTime = new Date();
            const response = await axios(payload.service.query);
            const endTime = new Date();

            result.time = endTime.getTime() - startTime.getTime();
            result.statusCode = response.status;
            result.status = response.status === payload.service.query.statusCode ? ResultStatus.SUCCESS : ResultStatus.FAILURE;
        }
        catch(err) {
            result.time = 0;
            result.status = ResultStatus.FAILURE;
            result.statusCode = err.response ? err.response.status : 0;
        }

        return result.save();
    }

    async getServiceMetrics(serviceInfo: GetServiceMetricsDTO) {
        const resultMetrices = await this.resultModel.find({}, {
            time: 1,
            status: 1,
            statusCode: 1,
            createdAt: 1,
            _id: 0,
        }).where({
            service: serviceInfo.serviceId,
        });

        return resultMetrices.map(e => {
            return {
                ...e,
                createdAt: moment(e.createdAt).format('HH:mm'),
            };
        });
    }
}
