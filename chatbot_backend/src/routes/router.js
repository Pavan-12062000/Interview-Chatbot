const express = require('express')
const router = express.Router()
const ChatbotService = require('../services/chatbot_service');
const logError = require('../utilities/errorLogger');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
 
const chatbotService = new ChatbotService();

// Configure Multer to save files with the original extension
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Use the original file extension
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext); // Append a timestamp to avoid filename collisions
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Unsupported file type'), false);
        }
    }
});
 
router.post('/register', async (req,res) => {
    try{
        response = chatbotService.register(req);
        res.send(response);
    }catch(err){
        logError(err);
    }
})
 
router.post('/login', async (req,res) => {
    try{
        const response = await chatbotService.login(req);
        res.send(response);
    }catch(err){
        logError(err);
    }
})
 
router.get('/home', async (req, res) => {
    try{
        const response = await chatbotService.home(req);
        res.send(response);
    }catch(err){
        logError(err);
    }
})
 
router.get('/chatHistory', async (req, res) => {
    try{
        const response = await chatbotService.chatHistory(req);
        res.send(response);
    }catch(err){
        logError(err);
    }
})
 
router.post('/createChatSession', async (req, res) => {
    try{
        const response = await chatbotService.createChatSession(req);
        res.send(response);
    }catch(err){
        logError(err);
    }
})
 
router.delete('/deleteChatSession', async (req, res) => {
    try{
        const response = await chatbotService.deleteChatSession(req);
        res.send(response);
    }catch(err){
        logError(err);
    }
})

router.post('/chat', upload.single('resume'), async (req, res) => {
    try {
        if (req.body.flag == 'true'){
            if (!req.file) {
                return res.status(400).send({ error: 'No file uploaded' });
            }
    
            // Check if the file is accessible
            if (!fs.existsSync(req.file.path)) {
                return res.status(500).send({ error: 'File not found after upload' });
            }
    
            // Check the file type
            const fileType = req.file.mimetype;
            if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(fileType)) {
                return res.status(400).send({ error: 'Unsupported file type. Only PDF and DOCX are allowed.' });
            }
    
            const filePath = req.file.path;
            const response1 = await chatbotService.processResume(filePath);
            const response = await chatbotService.prechat(req, response1);
            res.send(response);

        }else{
            const response = await chatbotService.chat(req, null);
            res.send(response);
        }
        
    } catch (err) {
        logError(err);
    }
});

router.post('/rename', async (req, res) => {
    try{
        const response = await chatbotService.renameSession(req);
        res.send(response);
    }catch(err){
        logError(err);
    }
})

router.post('/forgotPassword', async (req, res) => {
    try{
        const response = await chatbotService.forgotPassword(req);
        res.send(response);
    }catch(err){
        logError(err);
    }
})

module.exports = router;