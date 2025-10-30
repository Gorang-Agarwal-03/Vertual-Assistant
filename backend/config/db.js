import mongoose from "mongoose";

const connectDB = async()=>{
    try{
            await mongoose.connect(process.env.MONGODB_URL)
            console.log("DB connected")
    } catch(e){
        console.log(e);

    }
}

export default connectDB