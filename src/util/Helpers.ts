import userService from "../models/User";
import fs from "fs";
import { ConnectionLog } from "Apptypes";
import crypto from "crypto";

const config = require("../config/app.json");

const getClientIp = (req: any) => req.ip.replace("::ffff:", "");

const updateIpFile = async () => {
    const ipList = await userService.getDistinctIpList();
    const template = require(config.whitelistIpFile.templatePath);
    template.whitelistIps = ipList;
    fs.writeFile(config.whitelistIpFile.path + config.whitelistIpFile.filename, JSON.stringify(template), function (error: any) {
        if (error) {
            return console.log(error);
        }
    });
};

const generateLogHash = (log: ConnectionLog): string => {

    const peerData = [log.peer_requester, log.peer_responder];
    peerData.sort((a, b) => {
        const num1 = Number(a.ip.split(".").map((num) => (`000${num}`).slice(-3)).join(""));
        const num2 = Number(b.ip.split(".").map((num) => (`000${num}`).slice(-3)).join(""));
        return num1 - num2;
    });
    const hashData = [peerData, log.tcp_hole_punch_result, log.is_direct_successful];
    const jsonData = JSON.stringify(hashData);
    return crypto.createHmac("sha256", "secret")
        .update(jsonData)
        .digest("hex");

};

export { updateIpFile, getClientIp, generateLogHash };