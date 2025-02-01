import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Modal,
  Fade,
  Backdrop,
  IconButton,
  Avatar,
  Tooltip,
} from "@mui/material";
import {
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  FormatListBulleted as BulletListIcon,
  FormatListNumbered as OrderedListIcon,
  Delete as DeleteIcon,
  Edit as RenameIcon,
  PowerSettingsNew as PowerOffIcon,
} from "@mui/icons-material";
import { apiService } from "../Apis/ApiService";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { useSnackbar } from "../utils/CustomSnackbar";
import { useNavigate } from "react-router-dom";

export default function MuiDocumentPage() {
  const storedUsername = localStorage.getItem("localStorageUsername");
  const [documents, setDocuments] = useState([]);
  const [open, setOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [docName, setDocName] = useState("");
  const [selectedDoc, setSelectedDoc] = useState("");
  const [newDocName, setNewDocName] = useState("");
  const { setSuccessSnackbarMessage, setFailureSnackbarMessage } = useSnackbar();
  const navigate = useNavigate();

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await apiService.getDocuments(storedUsername);
      setDocuments(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      setDocuments([]);
    }
  };

  const handleModalClose = () => {
    setOpen(false);
    setDocName("");
    editor?.commands.setContent("<p>Start writing...</p>");
  };

  const handleSave = async () => {
    const documentData = {
      fileName: docName,
      authorName: storedUsername,
      content: editor?.getHTML(),
    };
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
    }
    handleModalClose();
  };

  const handleDocumentClick = (docName, contentArray) => {
    const decodedContent = decodeContent(contentArray[0]);
    localStorage.setItem("editorDocName", docName);
    localStorage.setItem("editorDocContent", decodedContent);
    window.open("/editor", "_blank");
  };

  const handleDeleteClick = async (docName) => {
    try {
      const response = await apiService.handleDeleteDoc(docName, storedUsername);
      if (response === true) {
        setSuccessSnackbarMessage("Document deleted successfully!");
        setDocuments((prevDocuments) => prevDocuments.filter(doc => doc.documentNameList !== docName));
      } else {
        setFailureSnackbarMessage("Failed to delete the document.");
      }
    } catch (error) {
      setFailureSnackbarMessage("Error while deleting document.");
    }
  };

  const handleRenameClick = (docName) => {
    setSelectedDoc(docName);
    setNewDocName(docName);
    setRenameOpen(true);
  };

  const handleRenameConfirm = async () => {
    if (!newDocName.trim()) {
      setFailureSnackbarMessage("New document name cannot be empty.");
      return;
    }

    try {
      const response = await apiService.handleRenameDoc(selectedDoc, newDocName, storedUsername);
      if (response === true) {
        setSuccessSnackbarMessage("Document renamed successfully!");
        setDocuments((prevDocuments) =>
          prevDocuments.map((doc) =>
            doc.documentNameList === selectedDoc
              ? { ...doc, documentNameList: newDocName }
              : doc
          )
        );
        setRenameOpen(false);
      } else {
        setFailureSnackbarMessage("Failed to rename document.");
      }
    } catch (error) {
      setFailureSnackbarMessage("Error while renaming document.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("localStorageUsername");
    navigate("/");
    
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

  return (
    <Box sx={{ maxWidth: 1200, margin: "auto", padding: "45px", marginLeft: '75px' }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h4">{storedUsername}'s Documents</Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
            New
          </Button>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Tooltip title="Log Out">
            <IconButton onClick={handleLogout}>
              <PowerOffIcon color="error" />
            </IconButton>
          </Tooltip>

          <Avatar sx={{ marginLeft: 2 }}>{storedUsername?.charAt(0).toUpperCase()}</Avatar>
          <Typography variant="body1" sx={{ marginLeft: 2 }}>
            {storedUsername}
          </Typography>
        </Box>

      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: "none", borderBottom: "none" }}>
        <Table sx={{ minWidth: 650, marginTop: '45px' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Last Edited</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Owner</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>

            </TableRow>
          </TableHead>

          <TableBody>
            {documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">No documents found.</TableCell>
              </TableRow>
            ) : (
              documents.map((doc, index) => (
                <TableRow key={index}>
                  <TableCell onClick={() => handleDocumentClick(doc.documentNameList, doc.docContent)} style={{ cursor: "pointer" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {doc.docContent ? <FileIcon color="primary" /> : <FolderIcon color="primary" />}
                      <Typography variant="body1">{doc.documentNameList}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{doc.lastEdited}</TableCell>
                  <TableCell>{doc.author}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleRenameClick(doc.documentNameList)}>
                      <RenameIcon color="primary" />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(doc.documentNameList)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={open} onClose={handleModalClose} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}>
        <Fade in={open}>
          <Box sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            bgcolor: "background.paper",
            borderRadius: "8px",
            padding: 4,
            boxShadow: "none",
          }}>
            <Typography variant="h6" gutterBottom>Create New Document</Typography>
            <TextField label="Document Name" variant="outlined" fullWidth value={docName} onChange={(e) => setDocName(e.target.value)} sx={{ marginBottom: 2 }} />

            <div style={{ border: "1px solid #ddd", borderRadius: "4px", minHeight: "200px", padding: "10px", boxShadow: "none" }}>
              {editor && <EditorContent editor={editor} />}
            </div>

            <Box sx={{ marginTop: 2, display: "flex", gap: 1 }}>
              <IconButton onClick={() => editor?.chain().focus().toggleBold().run()}><BoldIcon /></IconButton>
              <IconButton onClick={() => editor?.chain().focus().toggleItalic().run()}><ItalicIcon /></IconButton>
              <IconButton onClick={() => editor?.chain().focus().toggleBulletList().run()}><BulletListIcon /></IconButton>
              <IconButton onClick={() => editor?.chain().focus().toggleOrderedList().run()}><OrderedListIcon /></IconButton>
            </Box>

            <Box sx={{ marginTop: 2, display: "flex", justifyContent: "space-between" }}>
              <Button variant="outlined" onClick={handleModalClose}>Cancel</Button>
              <Button variant="contained" color="primary" onClick={handleSave}>Save</Button>
            </Box>
          </Box>
        </Fade>
      </Modal>

      <Modal open={renameOpen} onClose={() => setRenameOpen(false)} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}>
        <Fade in={renameOpen}>
          <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 400, bgcolor: "background.paper", borderRadius: "8px", padding: 4 }}>
            <Typography variant="h6">Rename Document</Typography>
            <TextField fullWidth value={newDocName} onChange={(e) => setNewDocName(e.target.value)} sx={{ marginBottom: 2 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Button variant="outlined" onClick={() => setRenameOpen(false)}>Cancel</Button>
              <Button variant="contained" color="primary" onClick={handleRenameConfirm}>Rename</Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
}
