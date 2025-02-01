import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Menu,
  MenuItem,
} from "@mui/material";
import { apiService } from "../Apis/ApiService";
import { useSnackbar } from "../utils/CustomSnackbar";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { ArrowBack, Save } from "@mui/icons-material";

const DriveLayout = () => {
  const storedUsername = localStorage.getItem("localStorageUsername");
  const navigate = useNavigate();
  const { setSuccessSnackbarMessage, setFailureSnackbarMessage } = useSnackbar();
  const [fileName, setFileName] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [openCreateDocDialog, setOpenCreateDocDialog] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
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


  const handleSelect = (docName) => {
    setSelectedDocuments((prevSelected) => {
      const isSelected = prevSelected.includes(docName);
      return isSelected
        ? prevSelected.filter((name) => name !== docName)
        : [...prevSelected, docName];
    });
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
    if (selectedDocuments.length > 0) {
      setContextMenu({
        mouseX: event.clientX - 2,
        mouseY: event.clientY - 4
      });
    }
  };

  const handleClose = () => {
    setContextMenu(null);
  };


  const handleDelete =  () => {
    console.log("Deleting Documents:", selectedDocuments);
    setDocuments((prevDocs) =>
      prevDocs.filter((doc) => !selectedDocuments.includes(doc.documentNameList))
    );
    const response =  apiService.handleDeleteDoc(selectedDocuments,storedUsername);
    console.log(response);
    setSelectedDocuments([]); 
    handleClose();
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
          fetchDocuments(); 
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

  const fetchDocuments = async () => {
    try {
      const response = await apiService.getDocuments(storedUsername);
      // Update documents state by prepending the newly fetched list of documents
      setDocuments(response || []);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      setDocuments([]);
    }
  };

  const decodeContent = (base64Content) => {
    try {
      if (base64Content && typeof base64Content === "string" && /^[A-Za-z0-9+/=]+$/.test(base64Content)) {
        return atob(base64Content);
      } else {
        throw new Error("Invalid Base64 string");
      }
    } catch (error) {
      console.error("Error decoding content:", error);
      return "Invalid document content";
    }
  };

  const handleDocumentClick = (docName, contentArray) => {
    const decodedContent = decodeContent(contentArray[0]);
    localStorage.setItem("editorDocName", docName);
    localStorage.setItem("editorDocContent", decodedContent);
    window.open("/editor", "_blank");
  };

  useEffect(() => {
    if (storedUsername) {
      fetchDocuments();
    }
  }, [storedUsername]);

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#f1f1f1",
          padding: "10px",
        }}
      >
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
        <div style={{ marginTop: "20px" }} onContextMenu={handleContextMenu}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center">Select</TableCell>
                  <TableCell align="center">Name</TableCell>
                  <TableCell align="center">Last Edited By</TableCell>
                  <TableCell align="center">Activity</TableCell>
                  <TableCell align="center">Last Edited</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.length > 0 ? (
                  documents.map((doc, index) => (
                    <TableRow key={index} style={{ cursor: "pointer" }} >
                      <TableCell align="center">
                        <Checkbox
                          checked={selectedDocuments.includes(doc.documentNameList)}
                          onChange={() => handleSelect(doc.documentNameList)}
                        />
                      </TableCell>
                      <TableCell align="center" onClick={() => handleDocumentClick(doc.documentNameList, doc.docContent)}>{doc.documentNameList}</TableCell>
                      <TableCell align="center">{storedUsername}</TableCell>
                      <TableCell align="center">Hardcoded Activity</TableCell>
                      <TableCell align="center">{doc.lastEdited}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No documents available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Right-Click Context Menu */}
          <Menu
            open={contextMenu !== null}
            onClose={handleClose}
            anchorReference="anchorPosition"
            anchorPosition={
              contextMenu !== null
                ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                : undefined
            }
          >
            <MenuItem onClick={handleDelete}>Delete</MenuItem>
          </Menu>
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
                onChange={setEditorContent}
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
            <Button onClick={handleCloseCreateDocDialog} color="secondary" style={{ marginRight: "10px" }}>
              Cancel
            </Button>
            <Button onClick={handleSubmitCreateDoc} color="primary" startIcon={<Save />} style={{ marginLeft: "10px" }}>
              Save Document
            </Button>
          </DialogActions>
        </Dialog>
      </div>
      </div>
      );
};

      export default DriveLayout;