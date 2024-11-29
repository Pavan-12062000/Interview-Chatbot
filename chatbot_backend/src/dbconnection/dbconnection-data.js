const getDbConnection = require('../dbconnection/dbconnection')
let getDbConnectionInstance = new getDbConnection();
const queryConstantsInstance = require('../queryconstants/queryconstants');
const logError = require('../utilities/errorLogger');
const axios = require('axios');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
 
require('dotenv').config(); // Load environment variables from .env file
 
 
const NEBIUS_API_KEY = process.env.NEBIUS_API_KEY;
 
class DbConnection {
 
    async executeQuery(query, params) {
        let client;
        try {
            client = await getDbConnectionInstance.getConnection();
            const response = await client.query(query, params);
            return response;
        } catch (error) {
            logError(error);
            throw error;
        } finally {
            if (client) {
                client.release();
            }
        }
    }
 
    async register(firstname, lastname, email, password) {
            let query = queryConstantsInstance.register;
            let params = [firstname, lastname, email, password];
            const response = await this.executeQuery(query, params);
            return response;
    }
 
    async login(email, password) {
            let query = queryConstantsInstance.login;
            let params = [email, password];
            const response = await this.executeQuery(query, params);
            return response.rows;
    }
 
    previousMessages = [];
    job_description = '';
    resume = '';
 
    async getAIResponse(prompt = '', job_description = '', resume = '', previousMessages = []) {
        try {
            const messages = [
                {
                    role: "system",
                    content: `You are a professional job interviewer specializing in conducting structured and conversational interviews.
        Use the provided job description and candidate's resume to tailor your questions.
        Ask one question at a time and wait for the candidate's response before proceeding.
        Use the candidate's answers to inform your next question.
        Maintain a friendly and professional tone throughout the interview.
        Conclude the interview after approximately 5 minutes and provide constructive feedback on the candidate's strengths and areas for improvement.
        Begin the interview by giving the summary of the resume and job description first and then ask the candidate to introduce themselves.`
                },
                {
                    role: "user",
                    content: `Job Description: ${job_description}\n\nCandidate's Resume: ${resume}`
                },
                ...previousMessages, // Include prior conversation turns
                {
                    role: "user",
                    content: prompt // The candidate's latest response
                }
            ];
 
            const response = await axios.post(
                "https://api.studio.nebius.ai/v1/chat/completions",
                {
                    model: "meta-llama/Meta-Llama-3.1-8B-Instruct-fast",
                    messages: messages,
                    max_tokens: 1024, // Adjust as needed while considering token limits
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
            throw new Error("Nebius AI API error");
        }
    }
 
    async saveChatHistory(sessionId, sender, message) {
        let query = queryConstantsInstance.saveChatHistory;
        let params = [sessionId, sender, message];
        const response = await this.executeQuery(query, params);
        return response;
    }
 
    async prechat(flag, session_id, job_description, resume) {
        try {
            let aiResponse;
            let message;
            this.job_description = job_description;
            this.resume = resume;
            message = `Hi there! This is my resume: ${resume} and the job descrioption is: ${job_description}`;
            this.previousMessages.push({ role: "user", content: message });
            aiResponse = await this.getAIResponse(message, job_description, resume, this.previousMessages);
            // Save the user and AI responses to chat history
            this.previousMessages.push({ role: "assistant", content: aiResponse });
            await this.saveChatHistory(session_id, "Ai", aiResponse);
 
            return aiResponse;
        } catch (error) {
            return "Sorry, I am unable to process your request.";
        }
    }
 
    async chat(session_id, message) {
        try {
            let aiResponse;
            // Save the user message to chat history
            await this.saveChatHistory(session_id, "user", message);
            this.previousMessages.push({ role: "user", content: message });
            aiResponse = await this.getAIResponse(message, this.job_description, this.resume, this.previousMessages);
            this.previousMessages.push({ role: "assistant", content: aiResponse });
            // Save the AI response to chat history
            await this.saveChatHistory(session_id, "Ai", aiResponse);
            return aiResponse;
        } catch (error) {
            return "Sorry, I am unable to process your request.";
        }
    }
 
    async home(user_id) {
            let query = queryConstantsInstance.getSessionIds;
            let params = [user_id];
            const response = await this.executeQuery(query, params);
            return response.rows;
    }
 
    async chatHistory(session_id) {
            let query = queryConstantsInstance.getChatHistory;
            let params = [session_id];
            const response = await this.executeQuery(query, params);
            return response.rows;
    }
 
    async createChatSession(user_id, session_name) {
        let client;
        try {
            this.job_description = '';
            this, resume = '';
            client = await getDbConnectionInstance.getConnection();
            let query = queryConstantsInstance.createChatSession;
            let params = [user_id, session_name];
            const response = await client.query(query, params);
            return response.rows[0]; // Return the created session
        } catch (error) {
            logError(error);
            throw error;
        } finally {
            if (client) {
                await client.end();
            }
        }
    }
 
    async deleteChatSession(session_id) {
            let query = queryConstantsInstance.deleteChatSession;
            let params = [session_id];
            const response = await this.executeQuery(query, params);
            return response;
    }
 
    async processResume(filePath) {
        try {
            if (!fs.existsSync(filePath)) {
                throw new Error('File not found: ' + filePath);
            }
 
            const fileBuffer = fs.readFileSync(filePath);
            let text;
 
            if (filePath.endsWith('.pdf')) {
                const data = await pdfParse(fileBuffer);
                text = data.text;
            } else if (filePath.endsWith('.docx')) {
                const { value } = await mammoth.extractRawText({ buffer: fileBuffer });
                text = value || "Empty document or unsupported format.";
            } else {
                throw new Error('Unsupported file format');
            }
            fs.unlinkSync(filePath); // Optional: Clean up the uploaded file
 
            return text.trim();
        } catch (err) {
            throw new Error('Failed to process resume: ' + err.message);
        }
    }
 
    async renameSession(session_id, session_name) {
        let query = queryConstantsInstance.renameSession;
        let params = [session_name, session_id];
        const response = await this.executeQuery(query, params);
        return response.rows[0]; // Return the renamed session
    }
}
 
module.exports = DbConnection;