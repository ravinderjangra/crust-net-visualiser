import { Request, Response } from "express";

/**
 * GET /
 * Home page.
 */
export let index = (req: Request, res: Response) => {
  res.render("home", {
    title: "Home"
  });
};

export let success = (req: Request, res: Response) => {
  res.render("success", {
    title: "Success"
  });
};
