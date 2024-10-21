import express from 'express';
import { Messages } from '../Models/MessageModel.js';
import { Conversation } from '../Models/ConversationModel.js';
import { authenticateToken } from '../Utils/Authentication.js';

const MessageRouter = express.Router();

MessageRouter.post('/sendMessage/:id', authenticateToken, async (req, res) => {
    try {
        const { message } = req.body;
        const { id: receiverId } = req.params;
        console.log(receiverId);

        const senderId = req.user.id;
        console.log(message)
        console.log(senderId)
        if (!message) {
            return res.status(400).json({ error: "Message content is required." });
        }

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
            });
        }

        const newMessage = new Messages({
            senderId,
            receiverId,
            message,
        });


        conversation.messages.push(newMessage._id);

        await Promise.all([conversation.save(), newMessage.save()]);

       

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});


MessageRouter.get('/getMessage/:id', authenticateToken, async (req, res) => {
    try {
        const { id} = req.params;
        const senderId = req.user.id;

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, id] },
        }).populate("messages");

        if (!conversation) return res.status(200).json([]);

        const messages = conversation.messages;

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getMessages controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default MessageRouter;
