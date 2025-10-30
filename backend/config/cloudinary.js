import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"


const uploadOnCloudinary = async (filePath)=>{

      // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUD_NAME, 
        api_key: process.env.CLOUD_API, 
        api_secret: process.env.CLOUD_SECRET_KEY 
    });

    try {
        // Upload an image
     const uploadResult = await cloudinary.uploader
       .upload(filePath)
       fs.unlinkSync(filePath)
       return uploadResult.secure_url

    } catch (error) {
        fs.unlinkSync(filePath)
        return res.status(500).json({message:"Cloudinary Error"})  
    }
}

export default uploadOnCloudinary 