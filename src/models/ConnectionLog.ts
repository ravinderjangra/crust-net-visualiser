import { Document, Schema, Model, model } from "mongoose";
import { ConnectionLog } from "./../types/Apptypes";

export interface IConnectionLog extends ConnectionLog, Document {
    insert(): Promise<void>;
}

export const ConnectionLogSchema = new Schema({
    peer_requester: Object,
    peer_responder: Object,
    is_direct_successful: Boolean,
    utp_hole_punch_result: Object,
    tcp_hole_punch_result: Object,
    createdAt: Date
});

ConnectionLogSchema.pre("save", function (next: Function) {
    const now = new Date();
    if (!this.createdAt) {
        this.createdAt = now;
    }
    next();
});

ConnectionLogSchema.methods.insert = () => {
    return new Promise((resolve, reject) => {
        this.save((err: Error) => err ? reject(err) : resolve());
    });
};

const ConnectionLogModel: Model<IConnectionLog> = model<IConnectionLog>("ConnectionLog", ConnectionLogSchema);
export default ConnectionLogModel;
