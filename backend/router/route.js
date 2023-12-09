import { Router } from "express";
import {
  register,
  login,
  getUser,
  generateOTP,
  updateUser,
  verifyOTP,
  createResetSession,
  resetPassword,
  verifyUser
} from "../controllers/appControllers.js";
import { registerMail } from "../controllers/mailer.js";
import { Auth, localVariables } from "../middleware/auth.js";

const router = Router();

/** POST Methods */
router.post("/register", register);
router.post("/registerMail", registerMail);
router.post("/authenticate", verifyUser, (request, response) => response.end());
router.post("/login", verifyUser, login);

/** GET Methods */
router.get("/user/:username", getUser);
router.get("/generateOTP", [verifyUser, localVariables], generateOTP);
router.get("/verifyOTP", verifyUser, verifyOTP);
router.get("/createResetSession", createResetSession);

/** PUT Methods */
router.put("/updateuser", Auth, updateUser);
router.put("/resetPassword", verifyUser, resetPassword);

export default router;
