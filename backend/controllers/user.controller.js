import User from "../models/user.model.js"
import uploadOnCloudinary from "../config/cloudinary.js"
import geminiResponse from "../gemini.js"
import { response } from "express"
import moment from "moment"

export const getCurrentUser = async(req,res)=>{
    try {
        const userId =req.userId
        const user=await User.findById(userId).select("-password")

        if(!user){
            return res.status(400).json({message:"user not found"})
        }
        return res.status(200).json(user)
    } catch (error) {
        return res.status(400).json({message:"get current user error"})
    }
}

export const updateAssistant = async(req,res)=>{
    try {
        const {assistantName , imageUrl} = req.body
        let assistantImage;

        if(req.file){
            assistantImage = await uploadOnCloudinary(req.file.path)
        }else{
            assistantImage=imageUrl
        }

        const user = await User.findByIdAndUpdate(req.userId,{
            assistantName,assistantImage
        },{new:true}).select("-password")

        return res.status(200).json(user)

    } catch (error) {
        return res.status(400).json({message:"Update assistant error"})
    }
}

export const askToAssistant = async (req,res)=>{
    try {
        const {command} = req.body
        const user = await User.findById(req.userId);
        user.history.push(command)
        user.save()
        const userName = user.name
        const assistantName = user.assistantName
        const result  = await geminiResponse(command,assistantName,userName)

        const jsonMatch = result.match(/{[\s\S]*}/);
        if(!jsonMatch){
            return res.status(400).json({response:"sorry, I can't understand"})
        }
        const gemResult =JSON.parse(jsonMatch[0]) 

        const type= gemResult.type

        switch(type){
            case 'get_date':
                return res.json({
                    type,
                    userInput : gemResult.userinput,
                    response:`current date is ${moment().format("YYYY-MM-DD")}`
                });
             case 'get_time':
                return res.json({
                    type,
                    userInput : gemResult.userinput,
                    response:`current time is ${moment().format("hh:mm A")}`
                });
                 case 'get_day':
                return res.json({
                    type,
                    userInput : gemResult.userinput,
                    response:`current day is ${moment().format("dddd")}`
                });
                 case 'get_month':
                return res.json({
                    type,
                    userInput : gemResult.userinput,
                    response:`current month is ${moment().format("MMMM")}`
                });

                case 'google_search':
                case 'youtube_search':
                case 'youtube_play':
                case 'calculator_open':
                case 'calendar_open':
                case 'instagram_open':
                case 'facebook_open':
                case 'whatsapp_open':
                case 'music_open':
                case 'maps_open':
                case 'camera_open':
                case 'weather_show':
                case 'note_create':
                case 'reminder_set':
                case 'message_send':
                case 'email_send':
                case 'system_volume':
                case 'system_brightness':
                case 'joke':
                case 'greeting':
                case 'emotion_detected':
                case 'unknown':
                case 'free_chat':
                case 'assistant_info':
                    return res.json({
                        type,
                        userInput:gemResult.userinput,
                        response:gemResult.response,
                    })
                
                default:
                    return res.status(400).json({response: "I didn't understand command"})

        }


    } catch (error) {
        return res.status(500).json({response: "Ask assistant again"})
    }
}