import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './components/navigations/LoginSignup.jsx';
import Home from './components/navigations/Home.jsx';
import { SnackbarProvider } from './components/utils/CustomSnackbar.jsx'; 
import DocumentEditor from './components/DocumentHandler/DocumentEditor.jsx';
import GrantedDocumentAccessor from './components/navigations/GrantedDocumentAccessor.jsx';
import DocumentSender from './components/webSocketConfig/DocumentSender.jsx'
import DocumentReceiver from './components/webSocketConfig/DocumentReceiver.jsx';

const App = () => {
  return (
    <SnackbarProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/editor" element={<DocumentEditor />} />
          <Route path="/granted-doc" element={<GrantedDocumentAccessor />} />
          <Route path="/sender" element={<DocumentSender />} />
          <Route path="/receiver" element={<DocumentReceiver />} />
          </Routes>
      </Router>
    </SnackbarProvider>
  );
};

export default App;
