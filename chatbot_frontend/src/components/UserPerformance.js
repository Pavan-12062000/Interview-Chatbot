import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer
} from 'recharts';
import { getProgressMetrics, getChatMessages } from '../services/authService';
import logoImg from '../assets/images/2.0.png';

const UserPerformance = () => {
    const [metricsData, setMetricsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSession, setSelectedSession] = useState(null);
    const [sessionMessages, setSessionMessages] = useState([]);
    const navigate = useNavigate();


    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const userId = JSON.parse(localStorage.getItem('user_info'))?.id;
                if (!userId) {
                    throw new Error('User not found');
                }
                const data = await getProgressMetrics(userId);
                setMetricsData(data);
                console.log('Metrics Data: ', metricsData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    const handleSessionClick = async (session) => {
        try {
            setLoading(true);
            const messagesResponse = await getChatMessages(session.session_id);
            console.log('Chat messages:', messagesResponse);
            setSessionMessages(messagesResponse);
            setSelectedSession(session);
        } catch (err) {
            console.error('Error fetching chat messages:', err);
            setError('Failed to load chat messages');
        } finally {
            setLoading(false);
        }
    };

    const radarData = [
        {
            name: 'Clarity of Thought',
            value: metricsData?.overall?.Clarity_of_Thought || 0,

        },
        {
            name: 'Relevance',
            value: metricsData?.overall?.Relevance || 0,

        },
        {
            name: 'Depth of Knowledge',
            value: metricsData?.overall?.Depth_of_Knowledge || 0,

        },
        {
            name: 'Engagement',
            value: metricsData?.overall?.Engagement || 0,

        }
    ];

    return (
        <div className="mainpage">
            {/* Navbar */}
            <div className="performance-nav">
                <div className="nav-left">
                    <h2>Interview Performance Report</h2>
                </div>
                <div className="nav-center">
                    <img className="logo" src={logoImg} alt="logo" />
                    <h1>IntervBot</h1>
                </div>
                <div className="nav-right">
                    <button
                        className="performance-btn"
                        onClick={() => navigate('/mainpage')}
                    >
                        Back to Chat
                    </button>
                </div>
            </div>
            <Container fluid>
                <Row className="h-100 g-0">
                    <Col className="main-content-performance">
                        <Row className="g-4">
                            {/* Overall Performance Graph */}
                            <Col md={6}>
                                <Card className="metrics-card">
                                    <Card.Body>
                                        <Card.Title>Overall Performance</Card.Title>
                                        <div style={{ height: '400px' }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RadarChart data={radarData}>
                                                    <PolarGrid stroke="rgba(255,255,255,0.2)" gridType='circle' />
                                                    <PolarAngleAxis dataKey="name" tick={{ fill: '#fff', fontSize: 12 }} />
                                                    <PolarRadiusAxis
                                                        angle={30}
                                                        domain={[0, 10]}
                                                        tickCount={6}
                                                        tick={{ fill: '#fff', fontSize: 10 }}
                                                        axisLine={false}
                                                    />
                                                    <Radar
                                                        name="Scores"
                                                        dataKey="value"
                                                        stroke="#8F41E9"
                                                        fill="#8F41E9"
                                                        fillOpacity={0.3}
                                                    />
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>

                            {/* Performance Summary */}
                            <Col md={6}>
                                <Card className="metrics-card">
                                    <Card.Body>
                                        <Card.Title>Performance Summary</Card.Title>
                                        <div className="mt-4">
                                            <h4 className="text-success mb-3">Key Strengths</h4>
                                            <p>{metricsData?.summary?.strengths}</p>

                                            <h4 className="text-warning mt-4 mb-3">Areas for Improvement</h4>
                                            <p>{metricsData?.summary?.areas_of_improvement}</p>

                                            <h4 className="text-info mt-4 mb-3">Overall Performance</h4>
                                            <div className="overall-scores">
                                                <div className="score-item">
                                                    <span>Clarity of Thought</span>
                                                    <span className="score">{metricsData?.overall?.Clarity_of_Thought}/10</span>
                                                </div>
                                                <div className="score-item">
                                                    <span>Relevance</span>
                                                    <span className="score">{metricsData?.overall?.Relevance}/10</span>
                                                </div>
                                                <div className="score-item">
                                                    <span>Depth of Knowledge</span>
                                                    <span className="score">{metricsData?.overall?.Depth_of_Knowledge}/10</span>
                                                </div>
                                                <div className="score-item">
                                                    <span>Engagement</span>
                                                    <span className="score">{metricsData?.overall?.Engagement}/10</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>

                            {/* Session Details */}
                            <Col xs={12}>
                                <Card className="metrics-card session-details-container">
                                    <Card.Body>
                                        <Card.Title>Session Details</Card.Title>
                                        <Row className="g-4">
                                            {metricsData?.sessions?.map((session) => (
                                                <Col key={session.session_id} md={4} className="mb-4">
                                                    <Card
                                                        className="session-card hover-effect"
                                                        onClick={() => handleSessionClick(session)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <Card.Body>
                                                            <h5 className="mb-3">{session?.session_name}</h5>
                                                            <div style={{ height: '200px' }}>
                                                                <ResponsiveContainer width="100%" height="100%">
                                                                    <RadarChart data={[
                                                                        {
                                                                            name: 'Clarity',
                                                                            value: parseFloat(session.scores.Clarity_of_Thought)
                                                                        },
                                                                        {
                                                                            name: 'Relevance',
                                                                            value: parseFloat(session.scores.Relevance)
                                                                        },
                                                                        {
                                                                            name: 'Knowledge',
                                                                            value: parseFloat(session.scores.Depth_of_Knowledge)
                                                                        },
                                                                        {
                                                                            name: 'Engagement',
                                                                            value: parseFloat(session.scores.Engagement)
                                                                        }
                                                                    ]}>
                                                                        <PolarGrid stroke="rgba(255,255,255,0.2)" gridType='circle' />
                                                                        <PolarAngleAxis dataKey="name" tick={{ fill: '#fff', fontSize: 12 }} />
                                                                        <PolarRadiusAxis
                                                                            angle={30}
                                                                            domain={[0, 10]}
                                                                            tickCount={6}
                                                                            tick={{ fill: '#fff', fontSize: 10 }}
                                                                            axisLine={false}
                                                                        />
                                                                        <Radar
                                                                            name="Scores"
                                                                            dataKey="value"
                                                                            stroke="#8F41E9"
                                                                            fill="#8F41E9"
                                                                            fillOpacity={0.3}
                                                                        />
                                                                    </RadarChart>
                                                                </ResponsiveContainer>
                                                            </div>
                                                            <div className="mt-2 text-center">
                                                                <small className="text-white-50">Click to see details</small>
                                                            </div>
                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                            ))}
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Modal
                                show={!!selectedSession}
                                onHide={() => {
                                    setSelectedSession(null);
                                    setSessionMessages([]);
                                }}
                                size="xl"
                                className="session-details-modal"
                            >
                                <Modal.Header closeButton>
                                    <Modal.Title>{selectedSession?.session_name}</Modal.Title>
                                </Modal.Header>
                                <Modal.Body className="p-0">
                                    <Row className="g-0">
                                        <Col md={8} className="chat-history-column">
                                            <div className="chat-history-container">
                                                {sessionMessages.map((msg, index) => (
                                                    <div
                                                        key={index}
                                                        className={`message ${msg.sender.toLowerCase() === 'user' ? 'user' : 'ai'}`}
                                                    >
                                                        {msg.message}
                                                    </div>
                                                ))}
                                            </div>
                                        </Col>

                                        <Col md={4} className="scores-column">
                                            <div className="scores-container">
                                                <h5 className="mb-4">Performance Scores</h5>
                                                <div className="score-item">
                                                    <span>Clarity of Thought</span>
                                                    <span className="score">{selectedSession?.scores.Clarity_of_Thought}/10</span>
                                                </div>
                                                <div className="score-item">
                                                    <span>Relevance</span>
                                                    <span className="score">{selectedSession?.scores.Relevance}/10</span>
                                                </div>
                                                <div className="score-item">
                                                    <span>Depth of Knowledge</span>
                                                    <span className="score">{selectedSession?.scores.Depth_of_Knowledge}/10</span>
                                                </div>
                                                <div className="score-item">
                                                    <span>Engagement</span>
                                                    <span className="score">{selectedSession?.scores.Engagement}/10</span>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </Modal.Body>
                            </Modal>
                        </Row>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default UserPerformance;