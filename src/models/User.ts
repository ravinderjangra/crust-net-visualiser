import { Document, Schema, Model, model } from "mongoose";
import { User } from "./../types/AppTypes";

interface IUser extends User, Document { }

const UserSchema: Schema = new Schema({
    userId: String,
    userName: String,
    email: String,
    strategy: String,
    trustLevel: Number,
    ip: String,
    avatar: String,
    createdAt: Date
});

UserSchema.pre("validate", function (next: Function) {
    const now = new Date();
    if (!this.createdAt) {
        this.createdAt = now;
    }
    next();
});

const UserModel: Model<IUser> = model<IUser>("user", UserSchema);

export default UserModel;
