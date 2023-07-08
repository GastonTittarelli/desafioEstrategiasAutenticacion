import { Router } from "express";
import passport from "passport";
import { authMiddleware } from "../middlewares/auth.js";


const sessionRouter = Router();

sessionRouter.get("/register", (req, res) => {
    res.render("register", {})
})

sessionRouter.post("/register", passport.authenticate("register", {failureRedirect: "/api/session/failregister"}), async (req, res) => {
    res.render("login", {})
})

sessionRouter.get("/failregister", (req, res) => {
    res.render("registerError", {})
})

sessionRouter.get("/login", (req, res) => {
    res.render("login", {})
})

sessionRouter.post("/login", passport.authenticate("login", {failureRedirect: "/api/session/faillogin"}), async (req, res) => {
    if (!req.user) return res.render("loginError", {})
    req.session.user = req.user.email;
    res.render("usuario", {user: req.session.user})
})

sessionRouter.get("/faillogin", (req, res) => {
    res.render("loginError", {})
})

sessionRouter.get("/profile", authMiddleware, (req, res) => {
    res.render("usuario", {user: req.session.user})
})

sessionRouter.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        res.render("login")
    });
})

export default sessionRouter;