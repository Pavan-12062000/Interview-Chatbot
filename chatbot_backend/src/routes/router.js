const express = require('express')
const router = express.Router()
const ChatbotService = require('../services/chatbot_service');
const logError = require('../utilities/errorLogger');
 
const chatbotService = new ChatbotService();
 
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
 
router.post('/chat', async (req,res) => {
    try{
        const response = await chatbotService.chat(req);
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
 
module.exports = router;