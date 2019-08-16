"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rm = __importStar(require("typed-rest-client"));
const User_1 = __importDefault(require("../models/User"));
const restClient = new rm.RestClient("imagekit");
const checkIpAddress = (req) => __awaiter(this, void 0, void 0, function* () {
    const ipAddress = req.connection.remoteAddress;
    const now = new Date();
    const start = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 5, 30).getTime();
    const users = yield User_1.default.find({
        ipAddress: ipAddress,
        createdAt: { $gt: start, $lt: start + 86400000 }
    });
    return { ipAddress, captcha: users.length >= 3 ? true : false };
});
exports.index = (req, res) => __awaiter(this, void 0, void 0, function* () {
    const check = yield checkIpAddress(req);
    res.render("home", {
        siteKey: process.env.RECAPTCHA_SITE_KEY,
        recaptchaEnabled: check["captcha"]
    });
});
exports.register = (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const check = yield checkIpAddress(req);
        if (check["captcha"]) {
            if (req.body["g-recaptcha-response"] === undefined ||
                req.body["g-recaptcha-response"] === "" ||
                req.body["g-recaptcha-response"] === null) {
                throw "Captcha not entered.";
            }
            const secretKey = process.env.RECAPTCHA_SECRET;
            const verificationURL = "https://www.google.com/recaptcha/api/siteverify?secret=" +
                secretKey +
                "&response=" +
                req.body["g-recaptcha-response"];
            const captchaVerification = yield restClient.get(verificationURL);
            if (!captchaVerification.result["success"]) {
                throw "Captcha not Verified.";
            }
        }
        const data = req.body;
        if (data.password !== data.confirmPassword) {
            return res.status(200).json({ message: "User creation failed" });
        }
        yield new User_1.default({
            name: data.name,
            email: data.email,
            ipAddress: check["ipAddress"],
            password: data.password
        }).save();
        return res.status(200).json({ message: "User creation successful" });
    }
    catch (e) {
        return res.status(200).json({ message: "User creation failed. " + e });
    }
});
//# sourceMappingURL=home.js.map