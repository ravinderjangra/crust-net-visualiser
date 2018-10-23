import { Document, Schema, Model, model } from "mongoose";
import { IpGeoInfo } from "../types/AppTypes";

interface IGeoInfo extends IpGeoInfo, Document { }

const GeoInfoSchema: Schema = new Schema({
    ip: String,
    geo_info: Object,
    createdAt: Date
});

GeoInfoSchema.pre("validate", function (next: Function) {
    const now = new Date();
    if (!this.createdAt) {
        this.createdAt = now;
    }
    next();
});

const GeoInfoModel: Model<IGeoInfo> = model<IGeoInfo>("geoinfo", GeoInfoSchema);

export default GeoInfoModel;
