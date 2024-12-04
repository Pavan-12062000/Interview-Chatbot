import React, { useState, useRef } from 'react';
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
    FaEnvelope,
    FaUser
} from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/authService';
import { motion } from "framer-motion";
import logoImg from '../assets/images/2.0.png';

const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [registerError, setRegisterError] = useState('');

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
        setRegisterError('');
    };

    const validateForm = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const nameRegex = /^[a-zA-Z]{2,}$/;

        if (!formData.firstname.trim()) {
            newErrors.firstname = 'Please enter first name';
        } else if (!nameRegex.test(formData.firstname)) {
            newErrors.firstname = 'First name should contain only letters and be at least 2 characters';
        }

        if (!formData.lastname.trim()) {
            newErrors.lastname = 'Please enter last name';
        } else if (!nameRegex.test(formData.lastname)) {
            newErrors.lastname = 'Last name should contain only letters and be at least 2 characters';
        }

        if (!formData.email) {
            newErrors.email = 'Please enter email';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            newErrors.password = 'Please enter password';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setRegisterError('');

        try {
            const response = await register(
                formData.firstname,
                formData.lastname,
                formData.email,
                formData.password
            );

            if (response.success) {
                alert('Registration successful!');
                // Redirecting to login page
                navigate('/login', {
                    state: {
                        message: 'Registration successful! Please login.',
                        email: formData.email
                    }
                });
            }
        } catch (error) {
            console.error('Registration failed:', error);
            setRegisterError(error.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container fluid className="vh-100 bg-light d-flex align-items-center justify-content-center register">
            <motion.div
                ref={ref}
                animate="visible"
                initial="hidden"
                variants={animateVariants}
            >
                <Card className="border-0 shadow-sm" style={{ width: '400px' }}>
                    <Card.Body className="p-4">
                        <div className="text-center mb-4">
                            <img className='logo' src={logoImg}></img>
                            <h1 className="login-title mb-2">Create Account</h1>
                            <p className="login-subtitle">Please fill in the form to register</p>
                        </div>

                        {registerError && (
                            <Alert variant="danger" className="mb-4">
                                {registerError}
                            </Alert>
                        )}

                        <Form onSubmit={handleSubmit}>
                            {/* First Name Input */}
                            <Form.Group className="mb-3">
                                <div className="d-flex align-items-center mb-2">
                                    <FaUser className="text-muted me-2" size={20} />
                                    <span className="login-label">First Name</span>
                                </div>
                                <Form.Control
                                    type="text"
                                    name="firstname"
                                    value={formData.firstname}
                                    onChange={handleChange}
                                    isInvalid={!!errors.firstname}
                                    placeholder="Enter First Name"
                                    className="py-2 custom-input"
                                />
                                {errors.firstname && (
                                    <div className="text-danger small mt-1">
                                        {errors.firstname}
                                    </div>
                                )}
                            </Form.Group>

                            {/* Last Name Input */}
                            <Form.Group className="mb-3">
                                <div className="d-flex align-items-center mb-2">
                                    <FaUser className="text-muted me-2" size={20} />
                                    <span className="login-label">Last Name</span>
                                </div>
                                <Form.Control
                                    type="text"
                                    name="lastname"
                                    value={formData.lastname}
                                    onChange={handleChange}
                                    isInvalid={!!errors.lastname}
                                    placeholder="Enter Last Name"
                                    className="py-2 custom-input"
                                />
                                {errors.lastname && (
                                    <div className="text-danger small mt-1">
                                        {errors.lastname}
                                    </div>
                                )}
                            </Form.Group>

                            {/* Email Input */}
                            <Form.Group className="mb-3">
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
                                    placeholder="Enter Email"
                                    className="py-2 custom-input"
                                />
                                {errors.email && (
                                    <div className="text-danger small mt-1">
                                        {errors.email}
                                    </div>
                                )}
                            </Form.Group>

                            {/* Password Input */}
                            <Form.Group className="mb-3">
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
                                        placeholder="Enter Password"
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

                            {/* Confirm Password Input */}
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
                                        placeholder="Confirm Password"
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

                            {/* Register Button */}
                            <Button
                                variant="primary"
                                type="submit"
                                className="w-100 py-2 mb-4 login-text"
                                disabled={loading}
                            >
                                {loading ? 'Registering...' : 'Register'}
                            </Button>

                            {/* Login Link */}
                            <div className="text-center login-text">
                                <span className="text-muted">Already have an account? </span>
                                <Link to="/login" className="login-link">
                                    Login here
                                </Link>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            </motion.div>
        </Container>
    );
};

export default Register;