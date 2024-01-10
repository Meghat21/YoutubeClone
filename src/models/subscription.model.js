import mongoose from "mongoose";

const subscriptionSchema=new mongoose.Schema({
    suscriber:{
        type:mongoose.Schema.Types.ObjectId, //one who is suscribing to the channel
        ref:"User"
    },
    channel:{
        type:mongoose.Schema.Types.ObjectId, //to whom suscribing
        ref:"User"
    }

},{timestamps:true});

export const Subscription=mongoose.model("Subscription",subscriptionSchema)