import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Container,
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
import { forgotPassword } from '../services/authService';
import logoImg from '../assets/images/2.0.png';
import { motion } from "framer-motion";

const ResetPassword = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resetError, setResetError] = useState('');

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
    };

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
        setResetError('');
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
            newErrors.password = 'Please enter new password';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Should be at least 6 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please conirm your new password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setResetError('');

        try {
            const response = await forgotPassword(formData.email, formData.password);
            if (response.success) {
                navigate('/login', {
                    state: {
                        message: 'Password has been reset successfully. Please login with your new password.',
                        email: formData.email,
                        password: formData.password
                    }
                });
            }
        } catch (error) {
            console.error('Reset password failed:', error);
            setResetError(error.message || 'Failed to reset password, please try again');
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
                <Card className="border-0 shadow-sm" style={{ width: '400px' }}>
                    <Card.Body className="p-4">
                        <div className="text-center mb-4">
                            <img className='logo' src={logoImg} alt="Logo" />
                            <h2 className="login-title mb-2">
                                Reset Password
                            </h2>
                            <h3 className="login-subtitle">Enter your email and new password</h3>
                        </div>

                        {resetError && (
                            <Alert variant="danger" className="mb-4">
                                {resetError}
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
                                        {errors.email}
                                    </div>
                                )}
                            </Form.Group>

                            {/* Password Input */}
                            <Form.Group className="mb-4">
                                <div className="d-flex align-items-center mb-2">
                                    <FaLock className="text-muted me-2" size={20} />
                                    <span className="login-label">New Password</span>
                                </div>
                                <InputGroup>
                                    <Form.Control
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        isInvalid={!!errors.password}
                                        placeholder="Please Enter New Password"
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
                                        {errors.password}
                                    </div>
                                )}
                            </Form.Group>

                            {/* Confirm password */}
                            <Form.Group className="mb-4">
                                <div className="d-flex align-items-center mb-2">
                                    <FaLock className="text-muted me-2" size={20} />
                                    <span className="login-label">Confirm Password</span>
                                </div>
                                <InputGroup>
                                    <Form.Control
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        isInvalid={!!errors.confirmPassword}
                                        placeholder="Please Confirm New Password"
                                        className="py-2 custom-input"
                                    />
                                    <div className="password-button-container">
                                        <Button
                                            variant="link"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="password-toggle-button"
                                        >
                                            {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                                        </Button>
                                    </div>
                                </InputGroup>
                                {errors.confirmPassword && (
                                    <div className="text-danger small mt-1">
                                        {errors.confirmPassword}
                                    </div>
                                )}
                            </Form.Group>

                            {/* Reset Button */}
                            <Button
                                variant="primary"
                                type="submit"
                                className="w-100 py-2 mb-4 login-text"
                                disabled={loading}
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </Button>

                            {/* Back to Login */}
                            <div className="text-center login-text">
                                <Link to="/login" className="login-link">
                                    Back to Login
                                </Link>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            </motion.div>
        </Container>
    );
};

export default ResetPassword;