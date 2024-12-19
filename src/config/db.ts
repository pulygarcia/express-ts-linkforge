import mongoose from "mongoose";

export const db = async () => {
    //console.log('DB connection');
    try {
        await mongoose.connect(`${process.env.MONGO_URI}`);

        console.log('Connected successfully to Database');
    } catch (error:any) {
        console.log(error.message);
        process.exit(1);
    }
}