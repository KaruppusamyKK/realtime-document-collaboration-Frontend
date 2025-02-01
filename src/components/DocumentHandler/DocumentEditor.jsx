import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { apiService } from "../Apis/ApiService.jsx";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Dialog,
  TextField,
  Button,
  Chip,
  Avatar,
  Box,
  Divider,
} from "@mui/material";
import { Share as ShareIcon, CopyAll as CopyAllIcon, Person as PersonIcon } from "@mui/icons-material";
import { useSnackbar } from "../utils/CustomSnackbar.jsx";
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const DocumentEditor = () => {
  const [editorContent, setEditorContent] = useState("");
  const [docName, setDocName] = useState("");
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState([]);
  const [client, setClient] = useState(null);
  const [message, setMessage] = useState(""); // For storing received message
  const { setSuccessSnackbarMessage, setFailureSnackbarMessage } = useSnackbar();
  const storedUsername = localStorage.getItem("localStorageUsername");

  useEffect(() => {
    const savedDocName = localStorage.getItem("editorDocName");
    const savedDocContent = localStorage.getItem("editorDocContent");

    if (savedDocName && savedDocContent) {
      setDocName(savedDocName);
      setEditorContent(savedDocContent);
    } else {
      setDocName("Untitled Document");
    }
  }, []);

  useEffect(() => {
    // Establish WebSocket connection
    const socket = new SockJS('http://localhost:8080/websocket');
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
      console.log('Connected to WebSocket');
      setClient(stompClient);

      // Subscribe to the topic to receive document updates
      stompClient.subscribe('/document/send', (message) => {
        if (message.body) {
          const parsedMessage = JSON.parse(message.body);
          setMessage(parsedMessage.body.lastEditedMessage);
          setEditorContent(parsedMessage.body.lastEditedMessage); // Update the editor content
        } else {
          console.warn('Received empty message');
        }
      });
    }, (error) => {
      console.error('Error connecting to WebSocket:', error);
    });

    return () => {
      if (stompClient.connected) {
        stompClient.disconnect(() => console.log('WebSocket disconnected'));
      }
    };
  }, []);

  useEffect(() => {
    // Send message to WebSocket when the editor content changes
    if (client && editorContent !== message) {
      const timer = setTimeout(() => {
        client.send(
          '/app/lastEdited', 
          {}, 
          JSON.stringify({
            sender: storedUsername,
            receiver: 'User2',  // Can be dynamically set if needed
            lastEditedMessage: editorContent,
            documentName: docName,
          })
        );
      }, 200);  // Debounce mechanism to prevent excessive updates

      return () => clearTimeout(timer);
    }
  }, [editorContent, client]);

  const handleSave = async () => {
    const documentData = {
      fileName: docName,
      authorName: storedUsername,
      content: editorContent,
    };

    const response = await apiService.saveDocuInfo(documentData);
    if (response === true) {
      setSuccessSnackbarMessage("Document saved successfully!");
    } else {
      setFailureSnackbarMessage("Failed to save document.");
    }
  };

  const toggleShareDialog = () => {
    setIsShareDialogOpen(!isShareDialogOpen);
  };

  const handleAddEmail = () => {
    if (emailInput && !emails.includes(emailInput)) {
      setEmails([...emails, emailInput]);
      setEmailInput("");
    }
  };

  const handleDeleteEmail = (emailToDelete) => {
    setEmails(emails.filter((email) => email !== emailToDelete));
  };

  const handleCopyLink = () => {
    alert(editorContent)
    const link = process.env.REACT_APP_PROTECT_OR_OPEN_LINK;
    const url = `${link}?savedDocContent=${encodeURIComponent(
      editorContent
    )}&savedDocName=${encodeURIComponent(docName)}&isDocumentOpen=true`;
    
    navigator.clipboard.writeText(url)
      .then(() => {
        setSuccessSnackbarMessage("Link copied to clipboard!");
      })
      .catch(() => {
        setFailureSnackbarMessage("Failed to copy link.");
      });
  };

  const handleShare = async () => {
    alert(editorContent);
    const link = process.env.REACT_APP_PROTECT_OR_OPEN_LINK;
    const url = `${link}?savedDocContent=${encodeURIComponent(
      editorContent
    )}&savedDocName=${encodeURIComponent(docName)}`;

    const requestData = {
      documents: {
        documentName: docName,
        author: storedUsername,
        documentUrl: url,
      },
      emailLists: emails,
    };

    const response = await apiService.sendDocumentsThroughEmail(requestData);
    if (response === true) {
      setSuccessSnackbarMessage("Document shared successfully!");
    } else {
      setFailureSnackbarMessage("Failed to share document.");
    }
    toggleShareDialog();
  };

  return (
    <Box>
      {/* Header */}
      <AppBar position="static" style={{ backgroundColor: "#1a73e8" }}>
        <Toolbar style={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" style={{ fontWeight: "bold", color: "#fff" }}>
            {docName}
          </Typography>
          <Box style={{ display: "flex", alignItems: "center" }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleSave}
              style={{ marginRight: "10px" }}
            >
              Save
            </Button>
            <IconButton
              color="inherit"
              onClick={toggleShareDialog}
              style={{ marginRight: "10px" }}
            >
              <ShareIcon />
            </IconButton>
            <Avatar style={{ backgroundColor: "#f50057" }}>
              {storedUsername?.charAt(0)?.toUpperCase() || "U"}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Editor */}
      <Box style={{ 
        maxWidth: "900px", 
        margin: "20px auto", 
        padding: "20px", 
        borderRadius: "8px", 
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", 
        backgroundColor: "#f9f9f9", 
      }}>
        <ReactQuill
          theme="snow"
          value={editorContent}
          onChange={setEditorContent}
          style={{ 
            height: "400px", 
            borderRadius: "8px", 
            backgroundColor: "#fff", 
            padding: "10px",
          }}
          modules={{
            toolbar: [
              [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              ['bold', 'italic', 'underline'],
              ['link'],
              [{ 'align': [] }],
              ['image'],
            ],
          }}
        />
      </Box>

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onClose={toggleShareDialog} fullWidth maxWidth="sm">
        <Box padding={3}>
          <Typography variant="h6" gutterBottom>
            Share "{docName}"
          </Typography>
          <TextField
            label="Enter email addresses"
            variant="outlined"
            fullWidth
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            onKeyDown={(e) => (e.key === "Enter" ? handleAddEmail() : null)}
            style={{ marginBottom: "15px" }}
          />
          <Box style={{ marginBottom: "15px" }}>
            {emails.map((email, index) => (
              <Chip
                key={index}
                label={email}
                onDelete={() => handleDeleteEmail(email)}
                style={{ marginRight: "5px", marginBottom: "5px" }}
                color="primary"
              />
            ))}
          </Box>
          <Divider style={{ margin: "15px 0" }} />
          <Box style={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleCopyLink}
              startIcon={<CopyAllIcon />}
            >
              Copy Link
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleShare}
              disabled={emails.length === 0}
            >
              Share
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default DocumentEditor;
