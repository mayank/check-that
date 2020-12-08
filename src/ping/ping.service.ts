import { Injectable } from '@nestjs/common';
import { AddServiceDTO } from './dto/add-service.dto';
import { Model } from 'mongoose';
import { ServiceModel, HttpServiceModel, ServiceDocument, HttpServiceDocument } from './model/service.model';
import { InjectModel } from '@nestjs/mongoose';
import { PingGeneratorEvent } from './model/generator.event';
import axios from 'axios';
import { ResultDocument, ResultModel, ResultStatus } from './model/result.model';
import { GetServiceMetricsDTO } from './dto/get-service-info.dto';
import * as moment from 'moment';
import { head } from 'lodash';
import * as mongoose from 'mongoose';


@Injectable()
export class PingService {
    constructor(
        @InjectModel(ServiceModel.name) private readonly serviceModel: Model<ServiceDocument>,
        @InjectModel(HttpServiceModel.name) private readonly httpServiceModel: Model<HttpServiceDocument>,
        @InjectModel(ResultModel.name) private readonly resultModel: Model<ResultDocument>,
    ) { }

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
        const services = await this.serviceModel.find({}, { name: 1 });
        const results = [];
        for (const service of services) {
            const { upTime, failures } = await this.getUpTimeAndFailures(service);
            const avgResponseTime = await this.getAvgResponseTime(service);
            results.push({
                _id: service._id,
                name: service.name,
                upTime,
                avgResponseTime,
                failures,
            })
        }
        return results;
    }

    async getUpTimeAndFailures(service: ServiceDocument) {
        const failures = await this.resultModel.find()
            .where({
                status: ResultStatus.FAILURE,
                service,
            })
            .gte('createdAt', moment().subtract(1, 'month'))
            .count();

        const totalRequests = await this.resultModel.find()
            .gte('createdAt', moment().subtract(1, 'month'))
            .count();

        return {
            failures,
            upTime: (100 - (failures / totalRequests)).toFixed(3)
        };
    }

    async getAvgResponseTime(service: ServiceDocument) {
        const avgResponseTime = await this.resultModel.aggregate([
            {
                $match: {
                    service: service._id,
                    status: ResultStatus.SUCCESS,
                    createdAt: {
                        $gte: moment().subtract(1, 'month').toDate(),
                    }
                }
            },
            {
                $group: {
                    _id: '$id',
                    average: {
                        $avg: '$time'
                    }
                }
            },
        ]);

        return Math.round(head(avgResponseTime.map(e => e.average))) || 0;
    }

    async getNextWatchlist() {
        return this.serviceModel.find()
            .where('nextWatch').lte(Date())
            .populate('query');
    }

    async createNewHttpPing(payload: ServiceDocument) {
        const result = new this.resultModel({
            service: payload._id,
        });

        const startTime = new Date();

        try {
            const response = await axios(payload.query);
            const endTime = new Date();

            result.time = endTime.getTime() - startTime.getTime();
            result.statusCode = response.status;
            result.status = response.status === payload.query.statusCode ? ResultStatus.SUCCESS : ResultStatus.FAILURE;
        }
        catch (err) {
            console.log(err.message);
            const endTime = new Date();
            result.time = endTime.getTime() - startTime.getTime();
            result.status = ResultStatus.FAILURE;
            result.statusCode = err.response ? err.response.status : 0;
        }

        return await result.save();
    }

    async getServiceMetrics(serviceInfo: GetServiceMetricsDTO) {

        const resultMetrices = await this.resultModel.aggregate([
            {
                $match: {
                    service: mongoose.Types.ObjectId(serviceInfo.serviceId),
                    createdAt: {
                        $gte: moment().subtract(1, 'month').toDate(),
                    }
                }
            },
            {
                $group: {
                    _id: {
                        hour: { "$hour": "$createdAt" },
                        minute: { "$minute": "$createdAt" },
                    },
                    responseTime: {
                        $avg: {
                            $cond: [
                                { $eq: ['$status', ResultStatus.SUCCESS] }, '$time', 0
                            ]
                        }
                    },
                    failures: {
                        $sum: {
                            $cond: [
                                { $eq: ['$status', ResultStatus.FAILURE] }, 1, 0
                            ]
                        }
                    }
                }
            },
            {
                $sort: {
                    '_id.hour': 1,
                    '_id.minute': 1,
                }
            }
        ]);

        return resultMetrices.map(e => {
            return {
                t: Math.round(e.responseTime),
                f: e.failures,
                c: `${e._id.hour}:${String(e._id.minute).padStart(2, '0')}`,
            };
        });
    }
}
