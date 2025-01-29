import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AuthGuard } from './components/AuthGuard';

function App() {
  return (
            <Dashboard />
  );
}

export default App;
