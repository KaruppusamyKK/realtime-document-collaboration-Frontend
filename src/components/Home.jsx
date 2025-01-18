import React, { useEffect, useState } from "react";
import "./DriveLayout.css";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { apiService } from "./Apis/ApiService";
import { useSnackbar } from "./utils/CustomSnackbar";
import DocumentViewer from "./DocumentViewer ";


const DriveLayout = () => {
  const storedUsername = localStorage.getItem("localStorageUsername");
  const navigate = useNavigate();
  const { setSuccessSnackbarMessage, setFailureSnackbarMessage } = useSnackbar();

  const [documents, setDocuments] = useState({});
  const [openCreateDocDialog, setOpenCreateDocDialog] = useState(false);
  const [fileName, setFileName] = useState("");

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
    if (fileName) {
      const documentData = {
        fileName: fileName,
        authorName: storedUsername,
      };

      try {
        const response = await apiService.saveDocuInfo(documentData);
        if (response === true) {
          setSuccessSnackbarMessage("Document created successfully!");
          fetchDocuments(); // Refresh document list
        } else {
          setFailureSnackbarMessage("Failed to create document.");
        }
      } catch (error) {
        setFailureSnackbarMessage("Error while creating document.");
      } finally {
        setOpenCreateDocDialog(false);
      }
    } else {
      alert("Please provide a valid file name.");
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await apiService.getDocuments(storedUsername);
      setDocuments(response.documentsData || {});
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    }
  };

  useEffect(() => {
    if (storedUsername) {
      fetchDocuments();
    }
  }, [storedUsername]);

  return (
    <div className="drive-container">
      <div className="top-bar">
        <button className="new-button" onClick={handleOpenCreateDocDialog}>
          NEW
        </button>
        <input type="text" className="search-bar" placeholder="Search Drive" />
        <div className="top-icons">
          <span className="material-icons" onClick={logOut}>
            Log out
          </span>
        </div>
      </div>

      <div className="document-viewer-container">
        <DocumentViewer documents={documents} />
      </div>

      <Dialog
        open={openCreateDocDialog}
        onClose={handleCloseCreateDocDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create a New File</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="File Name"
            type="text"
            fullWidth
            variant="outlined"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDocDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmitCreateDoc} color="primary">
            Create File
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DriveLayout;
