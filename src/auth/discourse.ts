import crypto from "crypto";
import express, { json } from "express";
import axios from "axios";
import generateNonce from "a-nonce-generator";
import queryString from "query-string";
import DBUtils from "../util/dbhelper";
import Helpers from "../util/Helpers";

const config = require("../config/app.json");
const cred = require("../config/cred.json");


if (!cred || !cred.discourseSecret) {
    throw new Error("cred file is not found");
}

const sign = (data: any, secret: any) => {
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(data);
    return hmac.digest("hex");
};

const returnUrl = config.authReturnUrl[(process.env.NODE_ENV || "prod").trim()];

const router = express.Router();

router.get("/login", function (req, res, next) {
    const nonce = new generateNonce().generate();
    const payload = `nonce=${nonce}&return_sso_url=${returnUrl}`;
    const base64Payload = new Buffer(payload).toString("base64");
    const urlEncodedPayload = encodeURIComponent(base64Payload);
    const signature = sign(base64Payload, cred.discourseSecret);
    const generator = new Helpers();
    const user = {
        userid: generator.randomNumber(),
        email: "email",
        username: "username",
        trustLevel: "trust_level",
        strategy: "discourse",
        ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
    };
    new DBUtils().saveNetworkUser(JSON.stringify(user));
    res.redirect("/success");

    // res.redirect(`${config.discourseUrl}/session/sso_provider?sso=${urlEncodedPayload}&sig=${signature}`);
});
// [END authorize]

// [START callback]
router.get("/callback", async (req, res) => {
    try {
        const sso = req.query.sso;
        if (sign(sso, cred.discourseSecret) !== req.query.sig) {
            return res.redirect("/auth_response.html?err=Authorisation failed");
        }
        const data = queryString.parse(new Buffer(sso, "base64").toString());
        const userDetails = await axios.get(`${config.discourseUrl}/users/${data.username}.json`);
        req.session.passport = {
            user: {
                id: data.external_id,
                email: data.email,
                userName: data.username.toLowerCase(),
                trustLevel: userDetails.data.user.trust_level,
                strategy: "discourse"
            }
        };
        res.redirect(config.authConfirmURL);
    } catch (e) {
        return res.redirect("/auth_response.html?err=Authorisation failed." + (e || ""));
    }
});
// [END callback]

const discourseRouter = router;
export default discourseRouter;
