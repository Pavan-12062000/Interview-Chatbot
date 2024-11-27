import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LogIn from './components/LogIn'
import Register from './components/Register'
import MainPage from './components/MainPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function App() {
  return (

    <Routes>
      <Route path="/login" element={<LogIn />} />
      <Route path="/register" element={<Register />} />
      <Route path="/mainpage" element={<MainPage />} />
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
