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
            await this.saveChatHistory(session_id, "user", `Job description: ${job_description}`);
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

    async forgotPassword(email, password) {
        let query = queryConstantsInstance.forgotPassword;
        let params = [email, password];
        const response = await this.executeQuery(query, params);
        return response.rows[0]; // Return the user details
    }

    async getAIGraphResponse(response1) {
        try {
            const messages = [
                {
                    role: "system",
                    content: `You are a professional job interviewer specializing in conducting structured and conversational interviews. 
                    Analyze the conversation history provided below to evaluate the user's performance in the interview. 

                    Focus on evaluating the user's performance in the following areas for each session:
                    1. Clarity of Thought: How clearly the user expresses their ideas.
                    2. Relevance: How well the user's responses align with the questions asked.
                    3. Depth of Knowledge: The depth and accuracy of the information provided by the user.
                    4. Engagement: How engaged and responsive the user is throughout the conversation.

                    Please provide the results in a JSON format with the following structure only (without any other text or code):

                    {
                        "sessions": [
                            {
                            "session_id": "<Session ID>",
                            "session_name": "<Session Name>",
                            "scores": {
                                "Clarity_of_Thought": <Score>,
                                "Relevance": <Score>,
                                "Depth_of_Knowledge": <Score>,
                                "Engagement": <Score>
                            }
                            },
                            ...
                        ],
                        "overall": {
                            "Clarity_of_Thought": <Average Score>,
                            "Relevance": <Average Score>,
                            "Depth_of_Knowledge": <Average Score>,
                            "Engagement": <Average Score>
                        },
                        "summary": {
                            "strengths": "<Key strengths>",
                            "areas_of_improvement": "<Key areas for improvement>"
                        }
                    }
                    Chat History: '${response1}'`
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

    async progressGraph(user_id) {
        const sessions = await this.home(user_id);

        // Format sessions with chat history
        const formattedSessions = await Promise.all(
            sessions.map(async (session) => {
                const chatHistory = await this.chatHistory(session.session_id);
                const messages = chatHistory.map((entry) => ({
                    type: entry.sender === "Ai" ? "question" : "response",
                    content: entry.message,
                    timestamp: entry.timestamp,
                }));
                return {
                    session_id: session.session_id,
                    session_name: session.session_name,
                    messages: messages,
                };
            })
        );

        // Convert to plain text for Nebius AI
        const plainText = await this.formatChatForNebius(formattedSessions);
        console.log("Formatted Sessions (Plain Text):", plainText);

        // Send plain text to Nebius AI
        const aiResponse = await this.getAIGraphResponse(plainText);
        console.log("AI Response:", aiResponse);
        return aiResponse;
    }

    // Utility function to convert chat history to plain text
    async formatChatForNebius(sessions) {
        let formattedText = "";

        sessions.forEach((session) => {
            formattedText += `Session ID: ${session.session_id}\n`;
            formattedText += `Session name: ${session.session_name}\n`;

            session.messages.forEach((message) => {
                formattedText += `Timestamp: ${message.timestamp}\n`;
                formattedText += `${message.type}: ${message.content}\n`;
            });

            formattedText += "\n"; // Separate sessions
        });

        return formattedText.trim(); // Remove any trailing newlines
    }


}

module.exports = DbConnection;
