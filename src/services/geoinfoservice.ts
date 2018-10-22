import { IpGeoInfo } from "../types/AppTypes";

import GeoInfoModel from "../models/GeoInfoModel";

class GeoInfoService {
    ignoreFields: string = " ";

    projectOptions: any = { _id: 0, __v: 0 };

    insert(log: IpGeoInfo): Promise<void> {
        return new Promise((resolve, reject) => {
            GeoInfoModel.insertMany([log], (err: Error) => err ? reject(err) : resolve());
        });
    }

    getPossibleDuplicate(ip: string): Promise<IpGeoInfo> {
        return new Promise((resolve, reject) => {
            GeoInfoModel.findOne({ "ip": ip }, (err: Error, geoInfo: IpGeoInfo) => err ? reject(err) : resolve(geoInfo));
        });
    }
}

const geoInfoService = new GeoInfoService;
export default geoInfoService;
