import mongoose from "mongoose";

export const connectDB = async () => {
    const dbUrl: string = process.env.DATABASE_URL || "";
    try {
        await mongoose.connect(dbUrl).then((res: any) => {
            console.log(`Database connected with ${res.connection.host}`);
        });
    } catch (error: any) {
        console.log(error.message);
    }
};
