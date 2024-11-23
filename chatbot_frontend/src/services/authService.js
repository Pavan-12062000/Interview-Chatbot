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