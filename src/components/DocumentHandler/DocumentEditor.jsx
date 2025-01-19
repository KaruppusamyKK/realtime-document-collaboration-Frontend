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
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { useSnackbar } from "../utils/CustomSnackbar.jsx";
import CryptoJS from "crypto-js";

const DocumentEditor = () => {
  const [editorContent, setEditorContent] = useState("");
  const [docName, setDocName] = useState("");
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false); // New state for link modal
  const [email, setEmail] = useState("");
  const [shareOption, setShareOption] = useState("restricted");
  const [shareableUrl, setShareableUrl] = useState(""); // New state for shareable link
  const { setSuccessSnackbarMessage, setFailureSnackbarMessage } = useSnackbar();

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

  const handleRealTimeUpdate = (updatedData) => {
    if (updatedData.fileName === docName) {
      setEditorContent(updatedData.content);
    }
  };

  const handleSave = async () => {
    const encodedContent = btoa(editorContent);
    const decodedContent = atob(encodedContent);

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

  const handleShare = async () => {
    const hasAccess = shareOption === "anyone";
    const rawData = `${storedUsername}/${docName}/${email}`;
    const encryptionKey = "karuppusamy";
    const encryptedData = CryptoJS.AES.encrypt(rawData, encryptionKey).toString();
    const generatedShareableUrl = `${process.env.REACT_APP_BASE_FRONTEND_URL}/granted-doc?token=${encodeURIComponent(encryptedData)}&hasAccess=${hasAccess}`;
    setShareableUrl(generatedShareableUrl);
    toggleShareDialog(); 
    toggleLinkDialog(); 
    const accessData = {
      author: storedUsername,
      documentName: docName,
      hasAccess,
      email,
      documentUrl: generatedShareableUrl,
    };
    const response = await apiService.allowDocumentAccess(accessData);
    if (response === true) {
      setSuccessSnackbarMessage("Link share success!");
    } else {
      setFailureSnackbarMessage("Link share failure");
    }
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
        <div style={{ padding: "20px", width: "400px" }}>
          <Typography variant="h6" style={{ marginBottom: "20px" }}>
            Share "{docName}"
          </Typography>
          <TextField
            label="Add people, groups, and calendar events"
            variant="outlined"
            fullWidth
            style={{ marginBottom: "20px" }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div style={{ marginBottom: "20px" }}>
            <Typography variant="body2" style={{ marginBottom: "10px" }}>
              General access
            </Typography>
            <Select
              fullWidth
              value={shareOption}
              onChange={(e) => setShareOption(e.target.value)}
              variant="outlined"
            >
              <MenuItem value="restricted">Restricted</MenuItem>
              <MenuItem value="anyone">Anyone with the link</MenuItem>
            </Select>
          </div>
          <Button
            variant="contained"
            color="primary"
            onClick={handleShare}
            style={{ width: "100%" }}
          >
            Done
          </Button>
        </div>
      </Dialog>

      <Dialog open={isLinkDialogOpen} onClose={toggleLinkDialog}>
        <DialogTitle>Shareable Link</DialogTitle>
        <DialogContent>
          <Typography variant="body2">{shareableUrl}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleLinkDialog} color="primary">
            Close
          </Button>
        </DialogActions>
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
