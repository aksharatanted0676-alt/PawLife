import mongoose, { Schema } from "mongoose";

export interface UserDoc {
  name: string;
  email: string;
  passwordHash: string;
  petConnectAccountVerified?: boolean;
}

const userSchema = new Schema<UserDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    petConnectAccountVerified: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model<UserDoc>("User", userSchema);
