import mongoose, { Model } from "mongoose";
import crypto from "crypto";

export type UserModel = mongoose.Document & {
  name: string;
  email: string;
  password: string;
  ipAddress: string;
};

const userSchema: mongoose.Schema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true, index: true, required: true },
    password: { type: String, trim: true, required: true },
    salt: { type: String },
    ipAddress: { type: String, required: true }
  },
  { timestamps: true }
);

userSchema.pre("save", function(next) {
  if (this.password) {
    this.salt = crypto.randomBytes(16).toString("hex");
    this.password = crypto
      .pbkdf2Sync(this.password, this.salt, 1000, 64, "sha512")
      .toString("hex");
  }
  next();
});

userSchema.statics.authenticate = function(password: string) {
  const hash = crypto
    .pbkdf2Sync(this.password, this.salt, 1000, 64, "sha512")
    .toString("hex");
  return hash === password;
};

const User: Model<UserModel> = mongoose.model<UserModel>("users", userSchema);
export default User;
