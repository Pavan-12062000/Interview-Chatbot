const { query } = require('express');
const getDbConnection = require('../dbconnection/dbconnection')
let getDbConnectionInstance = new getDbConnection();
const queryConstantsInstance = require('../queryconstants/queryconstants');
const logError = require('../utilities/errorLogger');
const axios = require('axios');
 
require('dotenv').config(); // Load environment variables from .env file
 
 
const NEBIUS_API_KEY = process.env.NEBIUS_API_KEY;
 
class DbConnection{
    async register(firstname, lastname, email, password){
        let client;
        try{
            client = await getDbConnectionInstance.getConnection();
            let query = queryConstantsInstance.register;
            let params =[firstname, lastname, email, password];
            const response = await client.query(query, params);
            return response;
        }catch (error) {
            logError(error);
            throw error;
        }finally{
            if(client){
                await client.end();
            }
        }
    }
 
    async login(email, password){
        let client;
        try{
            client = await getDbConnectionInstance.getConnection();
            let query = queryConstantsInstance.login;
            let params =[email, password];
            const response = await client.query(query, params);
            return response.rows;
        }catch (error) {
            logError(error);
            throw error;
        }finally{
            if(client){
                await client.end();
            }
        }
    }
 
    async getAIResponse(prompt) {
        try {
            const response = await axios.post(
                "https://api.studio.nebius.ai/v1/chat/completions",
                {
                    model: "meta-llama/Meta-Llama-3.1-8B-Instruct-fast",
                    messages: [{ role: "user", content: prompt }],
                    max_tokens: 8192,
                    temperature: 0.7,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${NEBIUS_API_KEY}`,
                    },
                }
            );
            return response.data.choices[0].message.content.trim();
        } catch (error) {
            console.error("Error interacting with OpenAI:", error.response?.data || error.message);
            throw new Error("OpenAI API error");
        }
    }
   
    async saveChatHistory(sessionId, sender, message) {
        let client;
        try {
            client = await getDbConnectionInstance.getConnection();
            let query = queryConstantsInstance.saveChatHistory;
            let params = [sessionId, sender, message];
            const response = await client.query(query, params);
            return response;
        } catch (error) {
            logError(error);
            throw error;
        } finally {
            if (client) {
                await client.end();
            }
        }
    }
 
    async chat(message, flag, session_id){
        try{
            let aiResponse;
            if(flag == true){
                message = "Act as an interviewer. Ask questions to the candidate based on the job description provided and the candidate resume. And the candidate resume will be shared with you in a JSON format. Start with the basic questons and slowly increase the level of difficulty.";
            }
            aiResponse = await this.getAIResponse(message);
            // Save the user and AI responses to chat history
            await this.saveChatHistory(session_id, "user", message);
            await this.saveChatHistory(session_id, "Ai", aiResponse);
           
            return aiResponse;
        }catch (error) {
            console.error("Chatbot service error:", error.message);
            return "Sorry, I am unable to process your request.";
        }
    }
 
    async home(user_id){
        let client;
        try{
            client = await getDbConnectionInstance.getConnection();
            let query = queryConstantsInstance.getSessionIds;
            let params =[user_id];
            const response = await client.query(query, params);
            return response.rows;
        }catch (error) {
            logError(error);
            throw error;
        }finally{
            if(client){
                await client.end();
            }
        }
    }
 
    async chatHistory(session_id){
        let client;
        try{
            client = await getDbConnectionInstance.getConnection();
            let query = queryConstantsInstance.getChatHistory;
            let params =[session_id];
            const response = await client.query(query, params);
            return response.rows;
        }catch (error) {
            logError(error);
            throw error;
        }finally{
            if(client){
                await client.end();
            }
        }
    }
 
    async createChatSession(user_id, session_name){
        let client;
        try{
            client = await getDbConnectionInstance.getConnection();
            let query = queryConstantsInstance.createChatSession;
            let params =[user_id, session_name];
            const response = await client.query(query, params);
            return response.rows[0]; // Return the created session
        }catch (error) {
            logError(error);
            throw error;
        }finally{
            if(client){
                await client.end();
            }
        }
    }
 
    async deleteChatSession(session_id){
        let client;
        try{
            client = await getDbConnectionInstance.getConnection();
            let query = queryConstantsInstance.deleteChatSession;
            let params =[session_id];
            const response = await client.query(query, params);
            return response;
        }catch (error) {
            logError(error);
            throw error;
        }finally{
            if(client){
                await client.end();
            }
        }
    }
}
 
module.exports = DbConnection;