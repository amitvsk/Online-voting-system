const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
       
        name: {
            type: String,
            trim: true,
            required:true
        },
        position: {
            type: String,
            trim: true,
            required:true
        },
        logo:{
            data: Buffer,
            contentType: String
        },
        AdharNo:{
            type:Number,
            required:true
        },
        isDeleted:{
            type:Boolean,
            default:false
        },
        deletedAt:{
            type:String,
            default:null
        }
       
    }, { timestamps: true });

module.exports = mongoose.model('condidate', userSchema)