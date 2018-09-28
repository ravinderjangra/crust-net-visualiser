import { ConnectionLog } from "Apptypes";

import ConnectionLogModel from "../models/ConnectionLog";

class ConnectionLogService {
    ignoreFields: string = "-peer_requester.geo_info.postal -peer_requester.geo_info.timezone -peer_requester.geo_info.longitude -peer_requester.geo_info.utc_offset " +
        "-peer_requester.geo_info.latitude -peer_requester.geo_info.languages -peer_requester.geo_info.org -peer_requester.geo_info.ip -peer_requester.geo_info.city " +
        "-peer_requester.geo_info.in_eu -peer_requester.geo_info.asn -peer_requester.geo_info.country_calling_code -peer_requester.geo_info.currency " +
        "-peer_requester.geo_info.continent_code -peer_responder.geo_info.continent_code " +
        "-peer_responder.geo_info.postal -peer_responder.geo_info.timezone -peer_responder.geo_info.longitude -peer_responder.geo_info.utc_offset " +
        "-peer_responder.geo_info.latitude -peer_responder.geo_info.languages -peer_responder.geo_info.org -peer_responder.geo_info.ip -peer_responder.geo_info.city " +
        "-peer_responder.geo_info.in_eu -peer_responder.geo_info.asn -peer_responder.geo_info.country_calling_code -peer_responder.geo_info.currency ";

    insert(log: ConnectionLog): Promise<void> {
        return new Promise((resolve, reject) => {
            ConnectionLogModel.insertMany([log], (err: Error) => err ? reject(err) : resolve());
        });
    }

    list(): Promise<Array<ConnectionLog>> {
        return new Promise((resolve, reject) => {
            ConnectionLogModel.find({}, { _id: 0, logDataHash: 0, __v: 0 }, (err: Error, logs: Array<ConnectionLog>) => err ? reject(err) : resolve(logs))
                .sort("-createdAt")
                .select(this.ignoreFields);
        });
    }

    listBetweenDates(startDate: Date, endDate: Date): Promise<Array<ConnectionLog>> {
        return new Promise((resolve, reject) => {
            ConnectionLogModel.find({ "createdAt": { "$gte": startDate, "$lt": endDate } }, { _id: 0, logDataHash: 0, __v: 0 }, (err: Error, logs: Array<ConnectionLog>) => err ? reject(err) : resolve(logs))
                .sort("-createdAt")
                .select(this.ignoreFields);
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