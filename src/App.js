import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home.jsx';
import LoginSignup from './components/LoginSignup.jsx';
import { SnackbarProvider } from './components/utils/CustomSnackbar.jsx'; 

const App = () => {
  return (
    <SnackbarProvider> 
      <Router>
        <Routes>
          <Route path="/" element={<LoginSignup />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </Router>
    </SnackbarProvider>
  );
};

export default App;
