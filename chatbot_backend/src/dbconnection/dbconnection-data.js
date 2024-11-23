const { query } = require('express');
const getDbConnection = require('../dbconnection/dbconnection')
let getDbConnectionInstance = new getDbConnection();
const queryConstantsInstance = require('../queryconstants/queryconstants');
const logError = require('../utilities/errorLogger');
const axios = require('axios');

require('dotenv').config(); // Load environment variables from .env file
console.log("Loaded OpenAI API Key:", process.env.OPENAI_API_KEY); // This should print the correct API key


const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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
            console.log("response", response.rows);
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
            console.log("Using API Key:", process.env.OPENAI_API_KEY); // Debug: Log the API key
            const response = await axios.post(
                "https://api.openai.com/v1/chat/completions",
                {
                    model: "gpt-3.5-turbo", 
                    messages: [{ role: "user", content: prompt }],
                    max_tokens: 8192,
                    temperature: 0.7,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    },
                }
            );
            return response.data.choices[0].message.content.trim();
        } catch (error) {
            console.error("Error interacting with OpenAI:", error.response?.data || error.message);
            throw new Error("OpenAI API error");
        }
    }
    

    async chat(message, flag){
        try{
            let aiResponse;
            console.log("In chat function", message, flag);
            // if(flag){
            //     message = "Act as an interviewer. Ask questions to the candidate based on the job description provided and the candidate resume.";
            //     aiResponse = await getAIResponse(message);
            // }else{
            //     aiResponse = await getAIResponse(message);
            // }
            aiResponse = await this.getAIResponse(message);
            return aiResponse;
        }catch (error) {
            console.error("Chatbot service error:", error.message);
            return "Sorry, I am unable to process your request.";
        }
    }
}

module.exports = DbConnection;