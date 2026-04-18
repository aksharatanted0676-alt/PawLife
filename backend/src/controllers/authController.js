import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { User } from "../models/User.js";
import { signJwt } from "../utils/jwt.js";
import { toPublicUser } from "../services/subscriptionService.js";
import { HttpError } from "../utils/httpError.js";
import { ok } from "../utils/apiResponse.js";
import { assertLoginPayload, assertSignupPayload } from "../validators/auth.validator.js";

export async function signup(req, res) {
  const { name, email, password } = assertSignupPayload(req.body);

  const existing = await User.findOne({ email });
  if (existing) throw new HttpError(409, "Email already exists");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    passwordHash,
    subscriptionType: "free",
    subscriptionExpiry: null
  });

  const token = signJwt({ userId: user._id.toString(), email: user.email, name: user.name });
  const fresh = await User.findById(user._id).select("-passwordHash");
  return ok(res, { token, user: toPublicUser(fresh) }, "Account created", 201);
}

export async function login(req, res) {
  const { email, password } = assertLoginPayload(req.body);

  const user = await User.findOne({ email });
  if (!user) throw new HttpError(401, "Invalid credentials");

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new HttpError(401, "Invalid credentials");

  const token = signJwt({ userId: user._id.toString(), email: user.email, name: user.name });
  const fresh = await User.findById(user._id).select("-passwordHash");
  return ok(res, { token, user: toPublicUser(fresh) }, "Logged in");
}

export async function getMe(req, res) {
  const uid = new mongoose.Types.ObjectId(req.user.userId);
  const user = await User.findById(uid).select("-passwordHash");
  if (!user) throw new HttpError(401, "User not found");
  return ok(res, { user: toPublicUser(user) });
}
