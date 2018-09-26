import { Document, Schema, Model, model} from "mongoose";
import { User } from "./../types/AppTypes";

interface IUser extends User, Document {
    upsert() : Promise<void>;
    getDistinctIpList() : Promise<Array<string>>;
}

const UserSchema: Schema = new Schema({
    peer_requester: Object,
    peer_responder: Object,
    is_direct_successful: Boolean,
    utp_hole_punch_result: Object,
    tcp_hole_punch_result: Object,
    createdAt: Date
});

UserSchema.pre("save", function(next: Function) {
    const now = new Date();
    if (!this.createdAt) {
      this.createdAt = now;
    }
    next();
});

UserSchema.methods.upsert = () => {
    return new Promise((resolve, reject) => {
        const opts = { upsert: true, new: true, setDefaultsOnInsert: true };
        this.findOneAndUpdate({userId: this.userId}, this, opts, (err: Error) => {
            err ? reject(err) : resolve();
        });
    });
};

UserSchema.methods.getDistinctIpList = () => {
    return new Promise((resolve, reject) => {
        const query = this.find({}).distinct("ip");
        query.exec(((err: Error, list: Array<string>) => err ? reject(err) : resolve(list)));
    });
};
const UserModel: Model<IUser> = model<IUser>("user", UserSchema);
export default UserModel;
