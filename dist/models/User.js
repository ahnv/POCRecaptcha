"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const crypto_1 = __importDefault(require("crypto"));
const userSchema = new mongoose_1.default.Schema({
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true, index: true, required: true },
    password: { type: String, trim: true, required: true },
    salt: { type: String },
    ipAddress: { type: String, required: true }
}, { timestamps: true });
userSchema.pre("save", function (next) {
    if (this.password) {
        this.salt = crypto_1.default.randomBytes(16).toString("hex");
        this.password = crypto_1.default
            .pbkdf2Sync(this.password, this.salt, 1000, 64, "sha512")
            .toString("hex");
    }
    next();
});
userSchema.statics.authenticate = function (password) {
    const hash = crypto_1.default
        .pbkdf2Sync(this.password, this.salt, 1000, 64, "sha512")
        .toString("hex");
    return hash === password;
};
const User = mongoose_1.default.model("users", userSchema);
exports.default = User;
//# sourceMappingURL=User.js.map