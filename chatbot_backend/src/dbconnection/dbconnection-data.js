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

   async getAIResponse(prompt, previousMessages = []) {
  try {
    const messages = [
      {
        role: "system",
        content: `You are a professional job interviewer specializing in conducting structured and conversational interviews.
        Use the provided job description and candidate's resume to tailor your questions.
        Ask one question at a time and wait for the candidate's response before proceeding.
        Use the candidate's answers to inform your next question.
        Maintain a friendly and professional tone throughout the interview.
        Conclude the interview after approximately 10 minutes and provide constructive feedback on the candidate's strengths and areas for improvement.`
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
    console.error("Error interacting with Nebius AI:", error.response?.data || error.message);
    throw new Error("Nebius AI API error");
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

    async prechat(flag, session_id, job_description, resume) {
        try {
            let aiResponse;
            if (flag == 'true') {
                message = `Act as a professional interviewer. Using the provided job description: '${job_description}' and the candidate's resume: '${resume}', conduct a structured and conversational interview. Begin by asking one question at a time. Wait for the candidate to respond before asking the next question. Use the candidate's responses to dynamically tailor the follow-up questions, starting with foundational topics and gradually increasing complexity. Conclude the interview after 10 minutes, and provide constructive feedback on the candidate's strengths and areas for improvement. Avoid giving all questions at once; maintain a natural and conversational flow.`;
            }
            console.log('Prechat message:', message);
            aiResponse = await this.getAIResponse(message);
            // Save the user and AI responses to chat history
            console.log('Prechat AI response:', aiResponse);
            await this.saveChatHistory(session_id, "Ai", aiResponse);

            return aiResponse;
        } catch (error) {
            console.error("Chatbot service error:", error.message);
            return "Sorry, I am unable to process your request.";
        }
    }

    async chat(session_id, message) {
        try {
            let aiResponse;
            // Save the user message to chat history
            console.log('Chat message:', message);
            await this.saveChatHistory(session_id, "user", message);
            aiResponse = await this.getAIResponse(message);
            console.log('Chat AI response:', aiResponse);
            // Save the AI response to chat history
            await this.saveChatHistory(session_id, "Ai", aiResponse);
            return aiResponse;
        } catch (error) {
            console.error("Chatbot service error:", error.message);
            return "Sorry, I am unable to process your request.";
        }
    }

    async home(user_id) {
        let client;
        try {
            client = await getDbConnectionInstance.getConnection();
            let query = queryConstantsInstance.getSessionIds;
            let params = [user_id];
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

    async chatHistory(session_id) {
        let client;
        try {
            console.log('Starting chatHistory for session:', session_id);

            client = await getDbConnectionInstance.getConnection();
            console.log('Got database connection');

            let query = queryConstantsInstance.getChatHistory;
            let params = [session_id];
            console.log('Before executing query:', query, params);

            const response = await client.query(query, params);
            console.log('Query executed successfully, rows:', response.rows.length);

            return response.rows;
        } catch (error) {
            console.error('Error in chatHistory:', error);
            logError(error);
            throw error;
        } finally {
            console.log('In finally block, client exists:', !!client);
            if (client) {
                console.log('Attempting to end client connection');
                try {
                    await client.end();
                    console.log('Client connection ended successfully');
                } catch (error) {
                    console.error('Error ending client connection:', error);
                }
            }
        }
    }

    async createChatSession(user_id, session_name) {
        let client;
        try {
            console.log('Creating chat session for user:', user_id, 'with name:', session_name);
            client = await getDbConnectionInstance.getConnection();
            let query = queryConstantsInstance.createChatSession;
            let params = [user_id, session_name];
            console.log('Before executing query:', query, params);
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
        let client;
        try {
            client = await getDbConnectionInstance.getConnection();
            let query = queryConstantsInstance.deleteChatSession;
            let params = [session_id];
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
        let client;
        try {
            client = await getDbConnectionInstance.getConnection();
            let query = queryConstantsInstance.renameSession;
            let params = [session_name, session_id];
            const response = await client.query(query, params);
            return response.rows[0]; // Return the renamed session
        } catch (error) {
            logError(error);
            throw error;
        } finally {
            if (client) {
                await client.end();
            }
        }
    }
}

module.exports = DbConnection;
