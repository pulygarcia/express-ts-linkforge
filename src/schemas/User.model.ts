import mongoose, {Schema} from "mongoose";

interface IUser {
    handle: string
    name: string
    email: string
    password: string
}

export const UserSchema:Schema = new mongoose.Schema({
    handle: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
})

const User = mongoose.model<IUser>('User', UserSchema);
export default User