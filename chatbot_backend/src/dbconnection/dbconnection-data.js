const { query } = require('express');
const getDbConnection = require('../dbconnection/dbconnection');
let getDbConnectionInstance = new getDbConnection();
const queryConstantsInstance = require('../queryconstants/queryconstants');
const logError = require('../utilities/errorLogger');
const axios = require('axios');

// Removed the dotenv and NEBIUS_API_KEY since we're using a local API
// require('dotenv').config(); // No longer needed

class DbConnection {
    async register(firstname, lastname, email, password) {
        let client;
        try {
            client = await getDbConnectionInstance.getConnection();
            let query = queryConstantsInstance.register;
            let params = [firstname, lastname, email, password];
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

    async login(email, password) {
        let client;
        try {
            client = await getDbConnectionInstance.getConnection();
            let query = queryConstantsInstance.login;
            let params = [email, password];
            const response = await client.query(query, params);
            return response.rows;
        } catch (error) {
            logError(error);
            throw error;
        } finally {
            if (client) {
                await client.end();
            }
        }
    }

    async getAIResponse(prompt) {
        try {
            const response = await axios.post(
                "http://localhost:11434/api/generate",
                {
                    model: "llama3.2",
                    prompt: prompt,
                    options: {
                        stream: false // Set to false to get the full response at once
                    }
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        // No Authorization header needed for local Ollama API
                    },
                }
            );
            return response.data.output.trim();
        } catch (error) {
            console.error("Error interacting with Ollama:", error.response?.data || error.message);
            throw new Error("Ollama API error");
        }
    }

    async chat(message, flag) {
        try {
            let aiResponse;
            if (flag == true) {
                message = "Act as an interviewer. Ask questions to the candidate based on the job description provided and the candidate resume.";
            }
            aiResponse = await this.getAIResponse(message);
            return aiResponse;
        } catch (error) {
            console.error("Chatbot service error:", error.message);
            return "Sorry, I am unable to process your request.";
        }
    }
}

module.exports = DbConnection;
