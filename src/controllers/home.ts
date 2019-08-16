import { Request, Response } from "express";
import * as rm from "typed-rest-client";
import User from "../models/User";

const restClient: rm.RestClient = new rm.RestClient("imagekit");

const checkIpAddress = async (req: Request) => {
  const ipAddress = req.connection.remoteAddress;
  const now = new Date();
  const start = new Date(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    5,
    30
  ).getTime();
  const users = await User.find({
    ipAddress: ipAddress,
    createdAt: { $gt: start, $lt: start + 86400000 }
  });
  return { ipAddress, captcha: users.length >= 3 ? true : false };
};

export let index = async (req: Request, res: Response) => {
  const check = await checkIpAddress(req);
  res.render("home", {
    siteKey: process.env.RECAPTCHA_SITE_KEY,
    recaptchaEnabled: check["captcha"]
  });
};

export let register = async (req: Request, res: Response) => {
  try {
    const check = await checkIpAddress(req);
    if (check["captcha"]) {
      if (
        req.body["g-recaptcha-response"] === undefined ||
        req.body["g-recaptcha-response"] === "" ||
        req.body["g-recaptcha-response"] === null
      ) {
        throw "Captcha not entered.";
      }
      const secretKey = process.env.RECAPTCHA_SECRET;
      const verificationURL =
        "https://www.google.com/recaptcha/api/siteverify?secret=" +
        secretKey +
        "&response=" +
        req.body["g-recaptcha-response"];
      const captchaVerification: any = await restClient.get(verificationURL);
      if (!captchaVerification.result["success"]) {
        throw "Captcha not Verified.";
      }
    }
    const data = req.body;
    if (data.password !== data.confirmPassword) {
      return res.status(200).json({ message: "User creation failed" });
    }
    await new User({
      name: data.name,
      email: data.email,
      ipAddress: check["ipAddress"],
      password: data.password
    }).save();
    return res.status(200).json({ message: "User creation successful" });
  } catch (e) {
    return res.status(200).json({ message: "User creation failed. " + e });
  }
};
