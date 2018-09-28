import { Request, Response } from "express";
import userService from "../services/userService";
const config = require("../config/app.json");
/**
 * GET /
 * Home page.
 */
export const index = (req: Request, res: Response) => {
  res.render("index", {
    title: "ejs"
  });
};

export const failure = (req: Request, res: Response) => {
  res.redirect("error.html");
};

export const success = async (req: Request, res: Response) => {
  try {
    const useremail = req.session.user.email;
    if (config.isMaidsafeOnly) {
      if (!useremail.endsWith("@maidsafe.net")) {
        return res.redirect("/error.html?err=" + "Restricted to MaidSafe internal testing");
      }
    }

    const user = await userService.findbyId(req.session.user.userId);
    if (user) {
      req.session.user = user;
      return res.redirect("/update_ip.html");
    }
    else {
      await userService.upsert(req.session.user).then(() => {
        userService.findbyId(req.session.user.userId).then(function (user) {
          console.log(user);
          req.session.user = user;
          res.redirect("/update_ip.html");
        });
      }).catch(e => {
        res.redirect("/error.html?err=" + e.message);
      });
    }
  } catch (e) {
    return res.redirect("/error.html?err=" + e.message);
  }
};
