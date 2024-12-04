import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useInView, motion, useAnimation } from "framer-motion"
import { useNavigate } from 'react-router-dom';
import headerImg from '../assets/images/2.0.png';

const HomePage = () => {
    const [loopNum, setLoopNum] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const toRotate = ["Mock interview", "Customized feedback", "Useful advices"];
    const [text, setText] = useState('');
    const [delta, setDelta] = useState(200 - Math.random() * 100);
    const period = 1000;
    const ref = useRef(null);
    const isInview = useInView(ref, { once: false });
    const control = useAnimation();
    const animateVariants = {
        hidden: { opacity: 0, y: -100 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    }
    const features = [
        "Real-time response",
        "Interview based on your resume & job description",
        "Voice input and response",
        "Performance metrics",
    ];
    const bubbleVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.3,
                duration: 0.5,
            },
        }),
    };
    const navigate = useNavigate();

    useEffect(() => {
        let ticker = setInterval(() => {
            tick();
        }, delta)

        if (isInview) {
            control.start("visible");
        }

        return () => { clearInterval(ticker) };
    }, [control, isInview, text])

    const tick = () => {
        let i = loopNum % toRotate.length;
        let fullText = toRotate[i];
        let updatedText = isDeleting ? fullText.substring(0, text.length - 1) : fullText.substring(0, text.length + 1);

        setText(updatedText);

        if (isDeleting) {
            setDelta(prevDelta => prevDelta / 2)
        }

        if (!isDeleting && updatedText === fullText) {
            setIsDeleting(true);
            setDelta(period);
        } else if (isDeleting && updatedText === '') {
            setIsDeleting(false);
            setLoopNum(loopNum + 1);
            setDelta(200);
        } else if (!isDeleting && updatedText !== fullText) {
            setDelta(prevDelta => prevDelta / 1.2);
        }
    }

    const handleClick = () => {
        navigate('/login');
    }

    return (
        <Container className='banner'>
            <Row className='align-items-center'>
                <Col className='firstCol' xs={12} md={6} xl={7}>
                    <motion.span
                        ref={ref}
                        animate={control}
                        variants="hidden"
                        className="tagline">
                        Empower Your Interview Journey with Confidence and Precision
                    </motion.span>
                    <motion.h1
                        ref={ref}
                        animate={control}
                        variants={animateVariants}
                        initial="hidden">
                        {`IntervBot will provide you with `}
                        <span className='wrap'>{text}</span>
                    </motion.h1>
                    <p>
                        Various features:
                        <div className="feature-container">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    className='bubble'
                                    variants={bubbleVariants}
                                    initial="hidden"
                                    animate="visible"
                                    custom={index}
                                >
                                    {feature}
                                </motion.div>
                            ))}
                        </div>
                    </p>
                </Col>
                <Col className='secondCol' xs={12} md={6} xl={5}>
                    <img src={headerImg} alt="Header img"></img>
                </Col>
            </Row>
            <Row className='align-items-center justify-content-center'>
                <button
                    className='animate_animated animate_fadeInUp'
                    onClick={() => handleClick()}
                >
                    Start your interview journey!
                </button>
            </Row>
        </Container>
    );
};

export default HomePage;