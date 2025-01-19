import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
} from "@mui/material";
import { apiService } from "../Apis/ApiService";
import { useSnackbar } from "../utils/CustomSnackbar";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; 
import { ArrowBack, Save } from "@mui/icons-material"; 
import DocumentViewer from "../DocumentHandler/DocumentViewer ";

const DriveLayout = () => {
  const storedUsername = localStorage.getItem("localStorageUsername");
  const navigate = useNavigate();
  const { setSuccessSnackbarMessage, setFailureSnackbarMessage } = useSnackbar();
  const [fileName, setFileName] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [openCreateDocDialog, setOpenCreateDocDialog] = useState(false);

  const logOut = () => {
    navigate("/");
    localStorage.removeItem("localStorageUsername");
  };



  const handleOpenCreateDocDialog = () => {
    setOpenCreateDocDialog(true);
  };

  const handleCloseCreateDocDialog = () => {
    setOpenCreateDocDialog(false);
  };

  const handleSubmitCreateDoc = async () => {
    if (fileName && editorContent) {
      const documentData = {
        fileName: fileName,
        authorName: storedUsername,
        content: editorContent,
      };
      console.log(documentData);
      try {
        const response = await apiService.saveDocuInfo(documentData);
        if (response === true) {
          setSuccessSnackbarMessage("Document created successfully!");
          // fetchDocuments();
        } else {
          setFailureSnackbarMessage("Failed to create document.");
        }
      } catch (error) {
        setFailureSnackbarMessage("Error while creating document.");
      } finally {
        setOpenCreateDocDialog(false);
      }
    } else {
      alert("Please provide a valid file name and content.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f1f1f1", padding: "10px" }}>
        <button
          style={{
            backgroundColor: "#4caf50",
            color: "white",
            padding: "10px 20px",
            fontSize: "16px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onClick={handleOpenCreateDocDialog}
        >
          NEW
        </button>
        <input
          type="text"
          style={{
            width: "50%",
            padding: "8px",
            fontSize: "14px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
          className="search-bar"
          placeholder="Search Drive"
        />
        <div style={{ display: "flex", alignItems: "center" }}>
          <span
            style={{ cursor: "pointer" }}
            className="material-icons"
            onClick={logOut}
          >
            Log out
          </span>
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <DocumentViewer />
      </div>

      {/* Dialog to create a new document */}
      <Dialog open={openCreateDocDialog} onClose={handleCloseCreateDocDialog} fullWidth maxWidth="md">
        <DialogTitle>
          <div style={{ display: "flex", alignItems: "center", fontWeight: "bold" }}>
            <IconButton edge="start" color="inherit" onClick={handleCloseCreateDocDialog}>
              <ArrowBack />
            </IconButton>
            <span>Create Document</span>
          </div>
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Document Name"
            variant="outlined"
            fullWidth
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            margin="normal"
            autoFocus
            style={{ marginBottom: "20px" }}
          />
          <div style={{ marginTop: "20px", height: "400px" }}>
            <ReactQuill
              value={editorContent}
              onChange={setEditorContent}  Update editor content state
              modules={{
                toolbar: [
                  [{ header: "1" }, { header: "2" }, { font: [] }],
                  [{ list: "ordered" }, { list: "bullet" }],
                  ["bold", "italic", "underline", "strike"],
                  ["link"],
                  [{ align: [] }],
                  ["clean"],
                ],
              }}
              placeholder="Start typing here..."
              style={{ height: "100%", border: "1px solid #ccc", borderRadius: "4px" }}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseCreateDocDialog}
            color="secondary"
            style={{ marginRight: "10px" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitCreateDoc}
            color="primary"
            startIcon={<Save />}
            style={{ marginLeft: "10px" }}
          >
            Save Document
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DriveLayout;
