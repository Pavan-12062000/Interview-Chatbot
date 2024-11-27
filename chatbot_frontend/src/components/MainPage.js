import React, { useState, useEffect } from 'react';
import { Menu, LogOut, Mic, FileUp, MoreVertical } from 'lucide-react';
import { getChatHistory, getChatMessages, createChatSession, sendMessage, deleteChatSession, uploadFile } from '../services/authService';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';

const MainPage = () => {
    // States
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [chatStarted, setChatStarted] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const [message, setMessage] = useState('');
    const [activeChat, setActiveChat] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    // Load chat history on component mount
    useEffect(() => {
        const loadChatHistory = async () => {
            try {
                setLoading(true);
                const userId = JSON.parse(localStorage.getItem('user_info'))?.id;
                if (userId) {
                    const history = await getChatHistory(userId);
                    setChatHistory(history);
                }
            } catch (err) {
                console.error('Error loading chat history:', err);
                setError('Failed to load chat history');
            } finally {
                setLoading(false);
            }
        };

        loadChatHistory();
    }, []);

    useEffect(() => {
        return () => {
            setMessages([]);
            setActiveChat(null);
            setChatStarted(false);
        };
    }, []);

    // Load messages for a specific chat
    const loadChatMessages = async (sessionId) => {
        try {
            setLoading(true);
            const response = await getChatMessages(sessionId);
            setMessages(response);
        } catch (err) {
            console.error('Error loading messages:', err);
            setError('Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    // Handle sending messages
    const handleSend = async () => {
        if (message.trim()) {
            try {
                setLoading(true);
                if (!chatStarted) {
                    const userInfo = JSON.parse(sessionStorage.getItem('user_info'));
                    console.log('User info:', userInfo)
                    const newSession = await createChatSession(userInfo.id, "New Chat Session");
                    setActiveChat(newSession.session_id);
                    setChatHistory([newSession, ...chatHistory]);
                    setChatStarted(true);
                }

                const userMessage = {
                    id: Date.now(),
                    sender: 'user',
                    message: message
                };
                setMessages(prevMessages => [...prevMessages, userMessage]);

                //console.log('activeChat:', activeChat)
                const response = await sendMessage(activeChat, message);
                //console.log('Server response:', response); 

                setMessage('');

                if (response) {
                    const aiMessage = {
                        id: Date.now() + 1,
                        sender: 'ai',
                        message: response
                    };
                    setMessages(prevMessages => [...prevMessages, aiMessage]);
                }

            } catch (err) {
                console.error('Error sending message:', err);
                setError('Failed to send message');
            } finally {
                setLoading(false);
            }
        }
    };

    // Handle chat selection
    const handleChatSelect = async (chatId) => {
        if (loading) return;

        try {
            setLoading(true);
            setMessages([]);
            setActiveChat(null);

            await new Promise(resolve => setTimeout(resolve, 100));

            setActiveChat(chatId);
            setChatStarted(true);
            const messages = await getChatMessages(chatId);
            setMessages(messages || []);
        } catch (err) {
            console.error('Error loading chat messages:', err);
            setError('Failed to load chat messages');
        } finally {
            setLoading(false);
        }
    };

    // Handle creating new chat
    const handleNewChat = async () => {
        try {
            const userId = JSON.parse(localStorage.getItem('user_info'))?.id;
            if (!userId) {
                throw new Error('User not found');
            }
            const newSession = await createChatSession(userId, "New Chat Session");
            setActiveChat(newSession.session_id);
            setChatHistory(prev => [newSession, ...prev]);
            setChatStarted(true);
            setMessages([]);
        } catch (err) {
            console.error('Error creating new chat:', err);
            setError('Failed to create new chat');
        }
    };

    // Handle chat deletion
    const handleDeleteChat = async (sessionId, e) => {
        e.stopPropagation();
        try {
            await deleteChatSession(sessionId);
            setChatHistory(prev => prev.filter(chat => chat.session_id !== sessionId));
            if (activeChat === sessionId) {
                setActiveChat(null);
                setChatStarted(false);
                setMessages([]);
            }
        } catch (err) {
            console.error('Error deleting chat:', err);
            setError('Failed to delete chat');
        }
    };

    // Handle file upload
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const response = await uploadFile(activeChat, file);
            await loadChatMessages(activeChat);
        } catch (err) {
            console.error('Error uploading file:', err);
            setError('Failed to upload file');
        } finally {
            setIsUploading(false);
        }
    };

    // Handle voice input
    const handleVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window)) {
            setError('Speech recognition is not supported in this browser.');
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setMessage(prev => prev + transcript);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setError('Failed to recognize speech');
        };

        recognition.start();
    };

    // Handle Enter key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem('user_info');
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    return (
        <div className="container-fluid vh-100 p-0">
            <div className="row h-100 g-0">
                {/* Sidebar */}
                <div
                    className="sidebar transition-all"
                    style={{
                        width: isSidebarVisible ? '250px' : '0',
                        minWidth: isSidebarVisible ? '250px' : '0'
                    }}
                >
                    <div className="sidebar-content h-100 d-flex flex-column">
                        {/* New Chat Button */}
                        <div className="p-3">
                            <button
                                className="btn btn-outline-dark w-100 text-start"
                                onClick={handleNewChat}
                            >
                                + New chat
                            </button>
                        </div>

                        {/* Chat History */}
                        <div className="px-3 flex-grow-1 overflow-auto">
                            {chatHistory.map((chat) => (
                                <div
                                    key={chat.session_id}
                                    className={`chat-history-item d-flex justify-content-between align-items-center ${activeChat === chat.session_id ? 'active' : ''}`}
                                    onClick={() => handleChatSelect(chat.session_id)}
                                >
                                    <span>{chat.session_name}</span>
                                    <div className="dropdown">
                                        <button
                                            className="btn btn-ghost btn-sm p-1"
                                            type="button"
                                            id={`dropdownMenuButton-${chat.session_id}`}
                                            data-bs-toggle="dropdown"
                                            aria-expanded="false"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <MoreVertical size={16} />
                                        </button>
                                        <ul
                                            className="dropdown-menu dropdown-menu-end"
                                            aria-labelledby={`dropdownMenuButton-${chat.session_id}`}
                                        >
                                            <li>
                                                <button
                                                    className="dropdown-item"
                                                    type="button"
                                                >
                                                    Rename
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    className="dropdown-item text-danger"
                                                    type="button"
                                                    onClick={(e) => handleDeleteChat(chat.session_id, e)}
                                                >
                                                    Delete
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="col h-100 d-flex flex-column">
                    {/* Header */}
                    <div className="chat-header border-bottom d-flex align-items-center justify-content-between">
                        <button
                            className="btn btn-ghost p-2"
                            onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                        >
                            <Menu size={20} />
                        </button>
                        <button
                            className="btn btn-ghost p-2"
                            onClick={handleLogout}
                        >
                            <LogOut size={20} />
                        </button>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="alert alert-danger alert-dismissible fade show m-2" role="alert">
                            {error}
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => setError(null)}
                            ></button>
                        </div>
                    )}

                    {/* Messages Area */}
                    <div className="flex-grow-1 overflow-auto">
                        {!chatStarted ? (
                            <div className="welcome-container">
                                <h2>Welcome to AI Interview Assistant</h2>
                                <p>Start a conversation to begin your interview preparation</p>
                            </div>
                        ) : (
                            <div className="p-4">
                                {messages.map((msg) => (
                                    <div key={msg.id} className="mb-4">
                                        <p className={`message-bubble ${msg.sender === 'user' ? 'user-message' : 'ai-message'}`}>
                                            {msg.message}
                                        </p>
                                    </div>
                                ))}
                                {loading && (
                                    <div className="text-center">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="input-area">
                        <div className="container-fluid">
                            <div className="input-group-container">
                                <div className="input-group">
                                    <button
                                        className="btn btn-ghost"
                                        title="Voice input"
                                        onClick={handleVoiceInput}
                                    >
                                        <Mic size={20} />
                                    </button>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Type your message..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                    />
                                    <input
                                        type="file"
                                        id="file-upload"
                                        hidden
                                        accept=".pdf,.docx"
                                        onChange={handleFileUpload}
                                    />
                                    <button
                                        className="btn btn-ghost"
                                        title="Upload file"
                                        onClick={() => document.getElementById('file-upload').click()}
                                    >
                                        <FileUp size={20} />
                                    </button>
                                    <button
                                        className="btn btn-dark px-4"
                                        onClick={handleSend}
                                        disabled={loading || isUploading}
                                    >
                                        Send
                                    </button>
                                </div>
                            </div>
                            <p className="text-center text-muted mt-2 small">
                                AI interview assistant. May produce inaccurate information.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainPage;