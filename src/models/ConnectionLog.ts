import { Document, Schema, Model, model } from "mongoose";
import { ConnectionLog } from "./../types/Apptypes";

export interface IConnectionLog extends ConnectionLog, Document {
}

export const ConnectionLogSchema = new Schema({
    peer_requester: Object,
    peer_responder: Object,
    is_direct_successful: Boolean,
    utp_hole_punch_result: Object,
    tcp_hole_punch_result: Object,
    logDataHash: String,
    createdAt: Date
});

ConnectionLogSchema.pre("validate", function (next) {
    const now = new Date();
    if (!this.createdAt) {
        this.createdAt = now;
    }
    next();
});

const ConnectionLogModel: Model<IConnectionLog> = model<IConnectionLog>("ConnectionLog", ConnectionLogSchema);
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
