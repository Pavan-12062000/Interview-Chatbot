import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
    Container,
    Row,
    Col,
    Card,
    Form,
    Button,
    Alert,
    InputGroup
} from 'react-bootstrap';
import {
    FaEye,
    FaEyeSlash,
    FaLock,
    FaEnvelope
} from 'react-icons/fa';
import { login, saveUserInfo, saveToken, getStoredUserInfo } from '../services/authService';
import logoImg from '../assets/images/2.0.png';
import { motion } from "framer-motion"

const LogIn = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const ref = useRef(null);
    const animateVariants = {
        hidden: {
            opacity: 0,
            y: 50,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 1,
                ease: "easeInOut"
            }
        }
    }
    // Check if there are any saved user info when rendering the component
    useEffect(() => {
        const rememberedUser = getStoredUserInfo();
        if (rememberedUser) {
            setFormData(prev => ({
                ...prev,
                email: rememberedUser.email || ''
            }));
            setRememberMe(true);
        }

        // Check if there is any successful register message
        if (location.state?.message) {
            setSuccessMessage(location.state.message);
            if (location.state.email) {
                setFormData(prev => ({
                    ...prev,
                    email: location.state.email
                }));
            }
            // Clear location state
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
        setLoginError('');
    };

    const validateForm = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.email) {
            newErrors.email = 'Please enter email';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            newErrors.password = 'Please enter password';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Should be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setLoginError('');

        try {
            const response = await login(formData.email, formData.password);
            console.log("response", response)

            if (response.success) {
                const userInfo = {
                    email: formData.email,
                    id: response.data[0].id
                    // Add other user info that should be remembered
                };

                // Save user info and token，decide store location according to rememberMe
                saveUserInfo(userInfo, rememberMe);
                saveToken(response.data.token, rememberMe);

                // TODO: Redirecting after login
                navigate('/mainpage');
                console.log("Login Successfully!")
            }
        } catch (error) {
            console.error('Login failed:', error);
            setLoginError(error.message || 'Login failed, please try again');
        } finally {
            setLoading(false);
        }
    };


    return (
        <Container fluid className="vh-100 bg-light d-flex align-items-center justify-content-center login">
            <motion.div
                ref={ref}
                animate="visible"
                initial="hidden"
                variants={animateVariants}
            >
                <Card className="border-0 shadow-sm card" style={{ width: '400px' }}>
                    <Card.Body className="p-4">
                        <div className="text-center mb-4">
                            <img className='logo' src={logoImg}></img>
                            <h2 className="login-title mb-2">
                                IntervBot
                            </h2>
                            <h3 className="login-subtitle">Login to your account</h3>
                        </div>

                        {successMessage && (
                            <Alert variant="success" className="mb-4">
                                {successMessage}
                            </Alert>
                        )}

                        {loginError && (
                            <Alert variant="danger" className="mb-4">
                                {loginError}
                            </Alert>
                        )}

                        <Form onSubmit={handleSubmit}>
                            {/* Email Input */}
                            <Form.Group className="mb-4">
                                <div className="d-flex align-items-center mb-2">
                                    <FaEnvelope className="text-muted me-2" size={20} />
                                    <span className="login-label">Email</span>
                                </div>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    isInvalid={!!errors.email}
                                    placeholder="Please Enter Email"
                                    className="py-2 custom-input"
                                />
                                {errors.email && (
                                    <div className="text-danger small mt-1">
                                        Please enter email
                                    </div>
                                )}
                            </Form.Group>

                            {/* Password Input */}
                            <Form.Group className="mb-4">
                                <div className="d-flex align-items-center mb-2">
                                    <FaLock className="text-muted me-2" size={20} />
                                    <span className="login-label">Password</span>
                                </div>
                                <InputGroup>
                                    <Form.Control
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        isInvalid={!!errors.password}
                                        placeholder="Please Enter Password"
                                        className="py-2 custom-input"
                                    />
                                    <div className="password-button-container">
                                        <Button
                                            variant="link"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="password-toggle-button"
                                        >
                                            {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                                        </Button>
                                    </div>
                                </InputGroup>
                                {errors.password && (
                                    <div className="text-danger small mt-1">
                                        Please enter password
                                    </div>
                                )}
                            </Form.Group>

                            {/* Remember Me and Forgot Password */}
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <Form.Check
                                    type="checkbox"
                                    label="Remember me"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="user-select-none login-text"
                                />
                                <Link to="/resetpassword" className="login-link">
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Login Button */}
                            <Button
                                variant="primary"
                                type="submit"
                                className="w-100 py-2 mb-4 login-text"
                                disabled={loading}
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </Button>

                            {/* Register Link */}
                            <div className="text-center login-text">
                                <span className="text-muted">Don't have an account? </span>
                                <Link to="/register" className="login-link">
                                    Register
                                </Link>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            </motion.div>
        </Container>
    );
};


export default LogIn;