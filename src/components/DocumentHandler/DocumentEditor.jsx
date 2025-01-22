import React, { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { apiService } from "../Apis/ApiService.jsx";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import PersonIcon from "@mui/icons-material/Person";
import ShareIcon from "@mui/icons-material/Share";
import Dialog from "@mui/material/Dialog";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { useSnackbar } from "../utils/CustomSnackbar.jsx";
import { Chip } from "@mui/material";
import { CopyAll as CopyAllIcon } from '@mui/icons-material';

const DocumentEditor = () => {
  const [editorContent, setEditorContent] = useState("");
  const [docName, setDocName] = useState("");
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const { setSuccessSnackbarMessage, setFailureSnackbarMessage } = useSnackbar();
  const [emails, setEmails] = useState([]);
  const [emailInput, setEmailInput] = useState('');
  const storedUsername = localStorage.getItem("localStorageUsername");

  useEffect(() => {
    const savedDocName = localStorage.getItem("editorDocName");
    const savedDocContent = localStorage.getItem("editorDocContent");

    if (savedDocName && savedDocContent) {
      setDocName(savedDocName);
      setEditorContent(savedDocContent);
    } else {
      alert("No document data found.");
    }
  }, []);



  const handleSave = async () => {
    const textEncoder = new TextEncoder();
    const textDecoder = new TextDecoder();
  
    // Encode content to base64
    const encodedContent = btoa(String.fromCharCode(...textEncoder.encode(editorContent)));
    const decodedContent = textDecoder.decode(Uint8Array.from(atob(encodedContent), c => c.charCodeAt(0)));
  
    const documentData = {
      fileName: docName,
      authorName: storedUsername,
      content: decodedContent,
    };
  
    const response = await apiService.saveDocuInfo(documentData);
    if (response === true) {
      setSuccessSnackbarMessage("Document created successfully!");
    } else {
      setFailureSnackbarMessage("Failed to create document.");
    }
  };
  

  const toggleShareDialog = () => {
    setIsShareDialogOpen(!isShareDialogOpen);
  };

  const toggleLinkDialog = () => {
    setIsLinkDialogOpen(!isLinkDialogOpen);
  };

  const handleAddEmail = () => {
    if (emailInput && !emails.includes(emailInput)) {
      setEmails([...emails, emailInput]);
      setEmailInput('');
    }
  };

  const handleDeleteEmail = (emailToDelete) => {
    setEmails(emails.filter(email => email !== emailToDelete));
  };

  const handleShare = async () => {
    console.log('Shared with emails:', emails);
    // const link = "http://localhost:3000/granted-doc/";
    const link = "https://dev-karuppusamy.netlify.app/granted-doc";
    const url = `${link}?savedDocContent=${encodeURIComponent(editorContent)}&savedDocName=${encodeURIComponent(docName)}`;
    const professionalUrl = url.replace(/%20/g, '+');
    const requestData = {
      documents: {
        documentName: docName,
        author: storedUsername,
        documentUrl: professionalUrl,
      },
      emailLists: emails,
    };
    const response = await apiService.sendDocumentsThroughEmail(requestData);
    toggleShareDialog();
  };

  const handleCopyLink = () => {
    // const link = "http://localhost:3000/granted-doc/";
    const link = "https://dev-karuppusamy.netlify.app/granted-doc";
    const url = `${link}?savedDocContent=${encodeURIComponent(editorContent)}&savedDocName=${encodeURIComponent(docName)}`;
    const professionalUrl = url.replace(/%20/g, '+');

    navigator.clipboard.writeText(professionalUrl)
      .then(() => {
        console.log('Link copied to clipboard');
      })
      .catch((error) => {
        console.error('Error copying link to clipboard:', error);
      });
    toggleShareDialog();
  };



  if (!docName || !editorContent) {
    return <p>Error: No document data provided.</p>;
  }

  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      <AppBar position="static" style={{ backgroundColor: "#f1f3f4", color: "#000" }}>
        <Toolbar style={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" style={{ fontSize: "16px", fontWeight: "bold" }}>
            {docName}
          </Typography>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              style={{ marginRight: "10px" }}
            >
              Save
            </Button>
            <IconButton onClick={toggleShareDialog} style={{ marginRight: "10px" }}>
              <ShareIcon titleAccess="Share" />
            </IconButton>
            <IconButton>
              <PersonIcon titleAccess={storedUsername || "Profile"} />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>



      <Dialog open={isShareDialogOpen} onClose={toggleShareDialog}>
        <div style={{ padding: '20px', width: '400px' }}>
          <Typography variant="h6" style={{ marginBottom: '20px' }}>
            Share "{docName}"
          </Typography>
          <div style={{ marginBottom: '20px' }}>
            <TextField
              label="Add people, groups, and calendar events"
              variant="outlined"
              fullWidth
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' ? handleAddEmail() : null}
            />
            <div style={{ marginTop: '10px' }}>
              {emails.map((email, index) => (
                <Chip
                  key={index}
                  label={email}
                  onDelete={() => handleDeleteEmail(email)}
                  style={{ marginRight: '5px', marginTop: '5px' }}
                />
              ))}
            </div>
          </div>
          <IconButton onClick={handleCopyLink} style={{ marginBottom: '20px', fontSize: '12px' }}>
            <CopyAllIcon style={{ fontSize: '20px' }} />
            Copy Link
          </IconButton>
          <Button
            variant="contained"
            color="primary"
            onClick={handleShare}
            style={{ width: '100%' }}
            disabled={emails.length === 0}
          >
            Send link
          </Button>
        </div>
      </Dialog>

      <div style={{ maxWidth: "800px", margin: "20px auto", padding: "20px" }}>
        <ReactQuill
          theme="snow"
          value={editorContent}
          onChange={setEditorContent}
          modules={{
            toolbar: {
              container: "#quill-toolbar",
            },
          }}
          style={{ height: "400px", marginBottom: "50px" }}
        />
        <div
          id="quill-toolbar"
          style={{
            position: "absolute",
            bottom: "501px",
            width: "19%",
            padding: "11px",
            justifyContent: "center",
            left: "260px",
            border: "none",
          }}
        >
          <button className="ql-bold" title="Bold"></button>
          <button className="ql-italic" title="Italic"></button>
          <button className="ql-underline" title="Underline"></button>
          <button className="ql-link" title="Link"></button>
          <button className="ql-list" value="bullet" title="Bullet List"></button>
          <button className="ql-list" value="ordered" title="Numbered List"></button>
        </div>
      </div>
    </div>
  );
};

export default DocumentEditor;
