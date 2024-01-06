import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"; //to manage file system
          
cloudinary.config({ 
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret
});

const uploadOnCloudinary=async(localFilePath)=>{
    try {
        if(!localFilePath) return null
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:'auto'
        })
        console.log(response.url)
        console.log("File has been uploaded on cloudinary")
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath) //remove the locally save file if the operation got failed
    }
}


// cloudinary.v2.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" }, 
//   function(error, result) {console.log(result); });


export {uploadOnCloudinary}