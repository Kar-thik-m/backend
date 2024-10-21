import jwt from 'jsonwebtoken';
import { usermodel } from '../Models/UserModel.js';

export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Access denied, no token provided' });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        
        const user = await usermodel.findOne({ email: decoded.email });

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        
        req.user = user;
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid token', error });
    }
};