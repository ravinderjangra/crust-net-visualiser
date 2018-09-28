import { ConnectionLog } from "Apptypes";

import ConnectionLogModel from "../models/ConnectionLog";

class ConnectionLogService {
    insert(log: ConnectionLog): Promise<void> {
        return new Promise((resolve, reject) => {
            ConnectionLogModel.insertMany([log], (err: Error) => err ? reject(err) : resolve());
        });
    }

    list(): Promise<Array<ConnectionLog>> {
        return new Promise((resolve, reject) => {
            ConnectionLogModel.find({}, { _id: 0, logDataHash: 0, _v: 0 }, (err: Error, logs: Array<ConnectionLog>) => err ? reject(err) : resolve(logs)).sort("-createdAt");
        });
    }

    listBetweenDates(startDate: Date, endDate: Date): Promise<Array<ConnectionLog>> {
        return new Promise((resolve, reject) => {
            ConnectionLogModel.find({ "createdAt": { "$gte": startDate, "$lt": endDate } }, { _id: 0, logDataHash: 0, _v: 0 }, (err: Error, logs: Array<ConnectionLog>) => err ? reject(err) : resolve(logs)).sort("-createdAt");
        });
    }

    getPossibleDuplicate(log: ConnectionLog): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            ConnectionLogModel.count({ "logDataHash": log.logDataHash }, function (err, c) {
                c > 0 ? resolve(true) : resolve(false);
            });
        });

    }
}

const connectionLogService = new ConnectionLogService;
export default connectionLogService;