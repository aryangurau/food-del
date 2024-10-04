import mongoose from "mongoose";

export const connectDB = async()=>{
    await mongoose.connect("mongodb+srv://aryangurau143:9809241661@cluster0.c8416.mongodb.net/food-del").then(()=>console.log("DB conected"));
}
