import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

// Store user info
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_info';
const REMEMBER_KEY = 'remember_me';

// Get user info
export const getStoredUserInfo = () => {
    const rememberedUser = localStorage.getItem(REMEMBER_KEY);
    if (rememberedUser) {
        return JSON.parse(rememberedUser);
    }
    return null;
};

// Save user info
export const saveUserInfo = (userInfo, remember = false) => {
    if (remember) {
        localStorage.setItem(REMEMBER_KEY, JSON.stringify(userInfo));
    } else {
        // If not remember me，use sessionStorage
        sessionStorage.setItem(USER_KEY, JSON.stringify(userInfo));
        localStorage.removeItem(REMEMBER_KEY);
    }
};

// Save token
export const saveToken = (token, remember = false) => {
    if (remember) {
        localStorage.setItem(TOKEN_KEY, token);
    } else {
        sessionStorage.setItem(TOKEN_KEY, token);
    }
};

// Clear all saved info
export const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
};

// API call
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(request => {
    console.log('Starting Request:', {
        url: request.url,
        method: request.method,
        data: request.data,
        headers: request.headers
    });
    return request;
});

api.interceptors.response.use(
    response => {
        console.log('Response:', response);
        return response;
    },
    error => {
        console.log('Response Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        return Promise.reject(error);
    }
);

export const register = async (firstname, lastname, email, password) => {
    try {
        const response = await api.post('/register', {
            params: {
                firstname,
                lastname,
                email,
                password
            }

        });
        console.log('Registration response:', response);

        if (response.data) {
            return {
                success: true,
                data: response.data
            };
        }
    } catch (error) {
        console.error('Registration error:', error.response || error);
        throw new Error(error.response?.data?.message || 'Registration failed');
    }
};

export const login = async (email, password) => {
    try {
        const response = await api.post('/login', {
            params: {
                email,
                password
            }
        });

        console.log('Login response:', response);

        if (response.data) {
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }

            localStorage.setItem('user_info', JSON.stringify(response.data[0]));

            return {
                success: true,
                data: response.data
            };
        }
    } catch (error) {
        console.error('Login error:', error.response || error);
        throw new Error(error.response?.data?.message || 'Login failed');
    }
};

export const getChatHistory = async (userId) => {
    try {
        const response = await api.get('/home', {
            headers: {
                params: JSON.stringify({ user_id: userId })
            }
        });
        return response.data;
    } catch (error) {
        console.error('Get chat history error:', error.response || error);
        throw new Error(error.response?.data?.message || 'Failed to get chat history');
    }
};

export const getChatMessages = async (sessionId) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
        console.log('Fetching messages for session:', sessionId);
        const response = await api.get('/chatHistory', {
            headers: {
                params: JSON.stringify({ session_id: sessionId })
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.data) {
            return [];
        }

        const messages = Array.isArray(response.data) ? response.data : [];
        console.log('Fetched messages count:', messages.length);
        return messages;

    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout');
        }
        throw error;
    }
};

export const createChatSession = async (userId, sessionName) => {
    try {
        const response = await api.post('/createChatSession', {
            params: {
                user_id: userId,
                session_name: sessionName
            }
        });
        //console.log('session response:', response.data)
        return response.data;
    } catch (error) {
        console.error('Create chat session error:', error.response || error);
        throw new Error(error.response?.data?.message || 'Failed to create chat session');
    }
};

export const sendMessage = async (sessionId, message) => {
    try {
        const response = await api.post('/chat', {
            params: {
                session_id: sessionId,
                message: message
            }
        });
        console.log('Chat response data:', response.data)
        return response.data;
    } catch (error) {
        console.error('Send message error:', error.response || error);
        throw new Error(error.response?.data?.message || 'Failed to send message');
    }
};

export const deleteChatSession = async (sessionId) => {
    try {
        const response = await api.delete('/deleteChatSession', {
            data: {
                params: {
                    session_id: sessionId
                }
            }
        });
        console.log('Delete session response:', response.data)
        return response?.data;
    } catch (error) {
        console.error('Delete chat session error:', error.response || error);
        throw new Error(error.response?.data?.message || 'Failed to delete chat session');
    }
};

export const startInterviewChat = async (sessionId, jobDescription, resumeFile) => {
    try {
        const formData = new FormData();
        formData.append('flag', 'true');
        formData.append('session_id', sessionId);
        formData.append('jobDescription', jobDescription);
        formData.append('resume', resumeFile);

        const response = await api.post('/chat', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            transformRequest: [(data) => data],
        });
        return response.data;
    } catch (error) {
        console.error('Start interview chat error:', error.response || error);
        throw new Error(error.response?.data?.message || 'Failed to start interview chat');
    }
};

export const renameSession = async (sessionId, newName) => {
    try {
        const response = await api.post('/rename', {
            params: {
                session_id: sessionId,
                session_name: newName
            }
        });
        return response.data;
    } catch (error) {
        console.error('Rename session error:', error.response || error);
        throw new Error(error.response?.data?.message || 'Failed to rename session');
    }
};