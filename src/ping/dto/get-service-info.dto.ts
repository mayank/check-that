import { IsNotEmpty } from 'class-validator';

export class GetServiceMetricsDTO {

    @IsNotEmpty()
    serviceId: string;

}