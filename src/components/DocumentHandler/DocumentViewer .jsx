import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { apiService } from '../Apis/ApiService.jsx';

const DocumentViewer = () => {
  const [documents, setDocuments] = useState([]);
  const storedUsername = localStorage.getItem("localStorageUsername");

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const response = await apiService.getDocuments(storedUsername);
        setDocuments(response || []);
      } catch (error) {
        console.error("Failed to fetch documents:", error);
        setDocuments([]);
      }
    };

    if (storedUsername) {
      fetchDocs();
    }
  }, [storedUsername]);

  const addNewDocument = (newDoc) => {
    setDocuments((prevDocs) => [...prevDocs, newDoc]);
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

  return (
    <div style={containerStyle}>
      <div style={{ marginTop: "25px" }}></div>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">Name</TableCell>
              <TableCell align="center">Last Edited By</TableCell>
              <TableCell align="center">Activity</TableCell>
              <TableCell align="center">Last Edited</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.length > 0 ? (
              documents.map((doc, index) => (
                <TableRow
                  key={index}
                  onClick={() => handleDocumentClick(doc.documentNameList, doc.docContent)}
                  style={{ cursor: "pointer" }}
                >
                  <TableCell align="center">{doc.documentNameList}</TableCell>
                  <TableCell align="center">{storedUsername}</TableCell>
                  <TableCell align="center">Hardcoded Activity</TableCell>
                  <TableCell align="center">{doc.lastEdited}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">No documents available.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

const containerStyle = { maxWidth: "1200px", margin: "0 auto", padding: "20px" };

export default DocumentViewer;
