import { Prop, SchemaFactory, Schema } from "@nestjs/mongoose";
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

export enum HttpMethods {
    GET = 'get',
    POST = 'post',
}

export enum VisibilityState {
    PRIVATE = 'private',
    PUBLIC = 'public',
}

@Schema()
export class HttpServiceModel {
    
    @Prop({ required: true })
    url: string;
    
    @Prop({ default: HttpMethods.GET })
    method: HttpMethods;

    @Prop()
    headers: string[];

    @Prop({ default: 300 })
    timeout: number;

    @Prop()
    data: string;

    @Prop({ default: 200 })
    statusCode: number;

    @Prop()
    regexp: string;
}

@Schema()
export class ServiceModel {

    @Prop({ required: true })
    name: string;

    @Prop({ default: VisibilityState.PRIVATE })
    status: VisibilityState;

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: HttpServiceModel.name })
    query: HttpServiceModel;

    @Prop({ default: 1 })
    interval: number;

    @Prop()
    nextWatch: Date;
}

export type ServiceDocument = ServiceModel & Document;
export type HttpServiceDocument = HttpServiceModel & Document;

export const ServiceSchema = SchemaFactory.createForClass(ServiceModel);
export const HttpServiceSchema = SchemaFactory.createForClass(HttpServiceModel);