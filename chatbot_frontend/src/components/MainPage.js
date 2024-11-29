import React, { useState, useEffect } from 'react';
import { Menu, LogOut, Mic, FileUp, MoreVertical } from 'lucide-react';
import { getChatHistory, getChatMessages, createChatSession, sendMessage, deleteChatSession, startInterviewChat, renameSession } from '../services/authService';
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
    const [jobDescription, setJobDescription] = useState('');
    const [resumeFile, setResumeFile] = useState(null);
    const [editSessionId, setEditSessionId] = useState(null);
    const [sessionName, setSessionName] = useState('');
    const [latestChatSession, setLatestChatSession] = useState('');
    const [isLatestChat, setIsLatestChat] = useState(false);


    // Load chat history on component mount
    useEffect(() => {
        const loadChatHistory = async () => {
            try {
                setLoading(true);
                const userId = JSON.parse(localStorage.getItem('user_info'))?.id;
                if (userId) {
                    const history = await getChatHistory(userId);
                    setChatHistory(history);
                    if (history.length > 0) {
                        setLatestChatSession(history[0].session_id);
                    }
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
                    const sessionCount = chatHistory.length + 1;
                    const userInfo = JSON.parse(sessionStorage.getItem('user_info'));
                    //console.log('User info:', userInfo)
                    setSessionName(`Chat Session ${sessionCount}`)
                    //const newSessionName = `Chat session ${sessionCount}`
                    const newSession = await createChatSession(userInfo.id, sessionName);
                    setChatHistory(prevChatHistory => [
                        {
                            user_id: userInfo.id,
                            session_name: sessionName
                        }, ...prevChatHistory]);
                    setActiveChat(newSession.session_id);
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

            const messages = await getChatMessages(chatId);
            if (!messages || messages.length === 0) {
                setChatStarted(false);
                setJobDescription('');
                setResumeFile(null);
            } else {
                setChatStarted(true);
                setMessages(messages);
            }

            if (chatId == latestChatSession) {
                setIsLatestChat(true);
            } else {
                setIsLatestChat(false);
            }
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
            setLoading(true)
            const userId = JSON.parse(localStorage.getItem('user_info'))?.id;
            if (!userId) {
                throw new Error('User not found');
            }
            const sessionCount = chatHistory.length + 1;
            const newSessionName = `Chat session ${sessionCount}`
            const newSession = await createChatSession(userId, newSessionName);
            const sessionWithName = {
                session_id: newSession.session_id,
                user_id: userId,
                session_name: newSessionName,
                ...newSession
            };

            await new Promise(resolve => {
                setChatHistory(prevChatHistory => {
                    const updatedHistory = [sessionWithName, ...prevChatHistory];
                    resolve(updatedHistory);
                    return updatedHistory;
                });
            });

            setActiveChat(newSession.session_id);
            setMessages([]);
            setLatestChatSession(newSession.session_id);
            setJobDescription('');
            setResumeFile(null);
            setChatStarted(false);
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

    const handleStartInterview = async () => {
        try {
            //console.log('Starting interview with:', {
            //jobDescription,
            //resumeFile: resumeFile ? resumeFile.name : null
            //});
            setLoading(true);
            let currentSessionId = activeChat;
            let sessionCreated = false;

            if (!activeChat) {
                const userInfo = JSON.parse(localStorage.getItem('user_info'));
                const sessionCount = chatHistory.length + 1;
                const newSessionName = `Chat Session ${sessionCount}`
                //console.log('Creating new session with name:', sessionName);
                const newSession = await createChatSession(userInfo.id, newSessionName)
                //console.log('New session response:', newSession);
                const sessionWithName = {
                    session_id: newSession.session_id,
                    user_id: userInfo.id,
                    session_name: newSessionName,
                    ...newSession
                };
                await new Promise(resolve => {
                    setChatHistory(prevChatHistory => {
                        const updatedHistory = [sessionWithName, ...prevChatHistory];
                        resolve(updatedHistory);
                        return updatedHistory;
                    });
                });
                currentSessionId = newSession.session_id;
                setActiveChat(currentSessionId);
                setLatestChatSession(currentSessionId);
                setIsLatestChat(true);
                sessionCreated = true;
            }

            const response = await startInterviewChat(
                currentSessionId,
                jobDescription,
                resumeFile
            );

            if (response) {
                setChatStarted(true);

                setMessages(prevMessages => [...prevMessages, {
                    id: Date.now(),
                    sender: 'user',
                    message: `Job Description:\n${jobDescription}`
                }]);

                setMessages(prevMessages => [...prevMessages, {
                    id: Date.now(),
                    sender: 'ai',
                    message: response
                }])

                setJobDescription('');
                setResumeFile(null);
                if (sessionCreated) {
                    const userId = JSON.parse(localStorage.getItem('user_info'))?.id;
                    const history = await getChatHistory(userId);
                    setChatHistory(history);
                }
            }

        } catch (err) {
            console.error('Error starting interview:', err);
            setError('Failed to start interview.');
        } finally {
            setLoading(false);
        }
    };

    const handleRename = async (sessionId, newName) => {
        try {
            await renameSession(sessionId, newName);

            setChatHistory(prevHistory =>
                prevHistory.map(chat =>
                    chat.session_id === sessionId
                        ? { ...chat, session_name: newName }
                        : chat
                )
            );

            setEditSessionId(null);
            setSessionName('');
        } catch (err) {
            console.error('Error renaming session:', err);
            setError('Failed to rename session');
        }
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
                                    {editSessionId === chat.session_id ? (
                                        <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            value={sessionName}
                                            onChange={(e) => setSessionName(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleRename(chat.session_id, sessionName);
                                                }
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            autoFocus
                                        />
                                    ) : (
                                        <span>{chat.session_name || 'Unnamed session'}</span>
                                    )}
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
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditSessionId(chat.session_id);
                                                        setSessionName(chat.session_name || '');
                                                    }}
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
                                <h2>Hi! I am your interview assistant.</h2>
                                <h5>Please upload your resume and job description to start the chat!</h5>
                                <div className='welcome-form'>
                                    <div className='mb-3'>
                                        <label className='form-label'>Job Description</label>
                                        <textarea
                                            className='form-control'
                                            rows='4'
                                            placeholder='Please input the job description here...'
                                            value={jobDescription}
                                            onChange={(e) => setJobDescription(e.target.value)}
                                        ></textarea>
                                    </div>
                                    <div className='mb-3'>
                                        <label className='form-label'>Resume</label>
                                        <div className='input-group'>
                                            <input
                                                type='file'
                                                className='form-control'
                                                accept='.pdf,.docx'
                                                onChange={(e) => setResumeFile(e.target.files[0])}
                                            />
                                        </div>
                                        {resumeFile && (
                                            <small className='text-muted'>
                                                Selected file: {resumeFile.name}
                                            </small>
                                        )}
                                    </div>
                                    <button
                                        className='btn btn-dark'
                                        disabled={!jobDescription.trim() || !resumeFile}
                                        onClick={handleStartInterview}
                                    >
                                        Start Chat
                                    </button>
                                </div>
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
                                    {/*
                                    <button
                                        className="btn btn-ghost"
                                        title="Voice input"
                                        onClick={handleVoiceInput}
                                    >
                                        <Mic size={20} />
                                    </button>
                                    */}
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Type your message..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        disabled={!chatStarted || !isLatestChat}
                                    />


                                    <button
                                        className="btn btn-dark px-4"
                                        onClick={handleSend}
                                        disabled={loading || !chatStarted || !isLatestChat}
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