import NetworkUser from "../models/NetworkUser";
import ConnectionLog from "../models/ConnectionLog";
const fs = require("fs");

export default class DBUtils {

    public async saveNetworkUser(networkuser: string) {
        try {
            const JsonObj = JSON.parse(networkuser);
            const query = { "userid": JsonObj.userid };
            const options = { upsert: true, new: true, setDefaultsOnInsert: true };
            const newvalues = {
                $set: {
                    username: JsonObj.username,
                    email: JsonObj.email,
                    ip: JsonObj.ip,
                    trustLevel: JsonObj.trustLevel,
                    strategy: JsonObj.strategy,
                }
            };
            NetworkUser.findOneAndUpdate(query, newvalues, options, function (err, doc) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("updated");
                }
            }
            );
            this.updateIPFile();
            console.log("Done!");
        } catch (e) {
            console.log(e);
        }
    }


    public async updateIPFile() {
        try {
            const query = NetworkUser.find({}).distinct("IP");
            query.exec(function (err, values) {
                fs.writeFile("ips.txt", values, function (error: any) {
                    if (error) {
                        return console.log(error);
                    }
                    console.log("The file was saved!");
                });

            });
            console.log("IP file updated!");
        } catch (e) {
            console.log(e);
        }
    }

    public async saveConnectionLog(connectionlog: string) {
        try {
            await ConnectionLog.insertMany(JSON.parse(connectionlog));
            console.log("Log Saved!");
        } catch (e) {
            console.log(e);
        }
    }

}