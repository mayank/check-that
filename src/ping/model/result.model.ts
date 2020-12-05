import { Prop, SchemaFactory, Schema } from "@nestjs/mongoose";
import { Document } from 'mongoose';
import { ServiceDocument, ServiceModel } from "./service.model";
import * as mongoose from 'mongoose';

export enum ResultStatus {
    SUCCESS = 'success',
    FAILURE = 'failure',
}

@Schema()
export class ResultModel {
    
    @Prop({ required: true })
    status: ResultStatus;

    @Prop({ required: true })
    time: number;

    @Prop({ required: true })
    statusCode: number;

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: ServiceModel.name })
    service: ServiceDocument;
}

export type ResultDocument = ResultModel & Document;

export const ResultSchema = SchemaFactory.createForClass(ResultModel);