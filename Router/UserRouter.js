import express from 'express';
import { usermodel } from '../Models/UserModel.js';
import bcrypt from "bcrypt"
import uploadFile from '../Utils/MulterAccess.js';
import getUrl from '../Utils/UrlGenerate.js';
import cloudinary from "cloudinary"
import { sendToken } from '../Utils/GetTokenAcess.js';
import { authenticateToken } from '../Utils/Authentication.js';
const userRouter = express.Router();


userRouter.post('/register', uploadFile, async (req, res) => {
    try {
        const payload = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const fileurl = getUrl(file);
        const cloud = await cloudinary.v2.uploader.upload(fileurl.content);

        const userCheck = await usermodel.findOne({ email: payload.email });
        if (userCheck) {
            return res.status(409).json({ message: "User already exists" });
        }


        const hash = await bcrypt.hash(payload.password, 10);

        const userdata = new usermodel({
            ...payload,
            password: hash,
            userimage: { id: cloud.public_id, url: cloud.secure_url }
        });

        await userdata.save();

        sendToken(userdata, 201, res);

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error registering user details' });
    }
});

userRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;


        const existingUser = await usermodel.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }


        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Incorrect password" });
        }


        sendToken(existingUser, 200, res);

    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ message: "Error in logging in" });
    }
});



userRouter.get('/profile', authenticateToken, async (req, res) => {
    try {

        const finduser = await usermodel.findOne({ email: req.user.email })

        if (!finduser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(finduser);
    } catch (error) {

        res.status(500).json({ message: 'Internal server error' });
    }
});

userRouter.get('/allusers', authenticateToken, async (req, res) => {
    try {
        const loggedInUserId = req.user.id;
        const users = await usermodel.find({ _id: { $ne: loggedInUserId } }, '-password');
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

userRouter.get('/search', authenticateToken, async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ message: 'Search query is required' });
    }

    try {

        const pins = await usermodel.find({
            username: { $regex: query, $options: 'i' }


        })

        res.status(200).json(pins);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

userRouter.get('/profile/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(404).json({ message: 'id not found' });
        }
        const isprofile = await usermodel.findById(id);

        if (!isprofile) {
            return res.status(404).json({ message: 'isprofile not found' });
        }
        res.status(200).json(isprofile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
})


userRouter.put('/updateprofile/:id', authenticateToken, uploadFile, async (req, res) => {
    try {
        const { username } = req.body;
        const userId = req.params.id;


        const existingUser = await usermodel.findById(userId);
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }


        if (username) {
            existingUser.username = username;
        }


        if (req.file) {
            const fileurl = getUrl(req.file);
            const uploadResult = await cloudinary.v2.uploader.upload(fileurl.content);
            if (existingUser.userimage && existingUser.userimage.id) {
                await cloudinary.v2.uploader.destroy(existingUser.userimage.id);
            }
            existingUser.userimage = { id: uploadResult.public_id, url: uploadResult.secure_url };
        }
        const updatedUser = await existingUser.save();

        res.json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        console.error(error.message);
        res.status(400).json({ message: error.message });
    }
});


export default userRouter;