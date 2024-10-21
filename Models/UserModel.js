import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'user'
    },
    userimage: {
        id: String,
        url: String,
    },
    

});
userSchema.methods.getJwtToken = function () {
    return jwt.sign({ email: this.email }, process.env.SECRET_KEY, {
        expiresIn: process.env.EXPIRES
    })
}

export const usermodel = mongoose.model('User', userSchema);