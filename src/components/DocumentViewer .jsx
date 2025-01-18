// import React, { useEffect, useState } from "react";
// import textFileIcon from "./assets/text-file-icon.svg";
// import { apiService } from "./Apis/ApiService";

// const DocumentViewer = () => {
//   const [documents, setDocuments] = useState({});
//   const [selectedDocument, setSelectedDocument] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const storedUsername = localStorage.getItem("localStorageUsername");

//   useEffect(() => {
//     const fetchDocs = async () => {
//       try {
//         const response = await apiService.getDocuments(storedUsername);
//         setDocuments(response.documentsData);
//       } catch (error) {
//         console.error("Failed to fetch documents:", error);
//       }
//     };

//     if (storedUsername) {
//       fetchDocs();
//     }
//   }, [storedUsername]);

//   const decodeContent = (base64Content) => {
//     try {
//       if (base64Content && typeof base64Content === "string" && /^[A-Za-z0-9+/=]+$/.test(base64Content)) {
//         return atob(base64Content);
//       } else {
//         throw new Error("Invalid Base64 string");
//       }
//     } catch (error) {
//       console.error("Error decoding content:", error);
//       return "Invalid document content";
//     }
//   };

//   const handleDocumentClick = (docName, contentArray) => {
//     const decodedContent = decodeContent(contentArray[0]);
//     setSelectedDocument({ docName, content: decodedContent });
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setSelectedDocument(null);
//   };

//   return (
//     <div style={containerStyle}>
//         <div style={{marginTop :'25px'}}></div>
//       <div style={fileListStyle}>
//         {Object.entries(documents).map(([docName, contentArray]) => (
//           <div
//             key={docName}
//             style={fileRowStyle}
//             onClick={() => handleDocumentClick(docName, contentArray)}
//           >
//             <img src={textFileIcon} alt="Text File Icon" style={fileIconStyle} />
//             <p style={fileNameStyle}>{docName}</p>
//             <p style={lastEditedStyle}>Last edited by Karuppusamy at 12:00:00</p>
//           </div>
//         ))}
//       </div>

//       {isModalOpen && selectedDocument && (
//         <div style={modalStyle}>
//           <div style={modalContentStyle}>
//             <h3>{selectedDocument.docName}</h3>
//             <div style={contentStyle}>{selectedDocument.content}</div>
//             <button onClick={closeModal}>Close</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const containerStyle = {
//   maxWidth: "1200px",
//   margin: "0 auto",
//   padding: "20px",
// };

// const fileListStyle = {
//   display: "flex",
//   flexDirection: "column",
//   gap: "10px",
// };

// const fileRowStyle = {
//   display: "flex",
//   alignItems: "center",
//   gap: "15px",
//   padding: "10px",
//   border: "1px solid #ddd",
//   borderRadius: "8px",
//   cursor: "pointer",
//   justifyContent: "space-between",
// };

// const fileIconStyle = {
//   width: "20px",
//   height: "20px",
// };

// const fileNameStyle = {
//   flex: "1",
//   fontSize: "16px",
//   fontWeight: "bold",
//   margin: "0",
// };

// const lastEditedStyle = {
//   fontSize: "14px",
//   color: "#666",
//   margin: "0",
//   whiteSpace: "nowrap",
// };

// const modalStyle = {
//   position: "fixed",
//   top: "0",
//   left: "0",
//   width: "100%",
//   height: "100%",
//   backgroundColor: "rgba(0, 0, 0, 0.5)",
//   display: "flex",
//   justifyContent: "center",
//   alignItems: "center",
//   zIndex: 1000,
// };

// const modalContentStyle = {
//   backgroundColor: "#fff",
//   padding: "20px",
//   borderRadius: "8px",
//   width: "80%",
//   maxWidth: "600px",
//   overflowY: "auto",
// };

// const contentStyle = {
//   whiteSpace: "pre-wrap",
//   fontFamily: "monospace",
//   fontSize: "14px",
//   lineHeight: "1.5",
//   color: "#333",
//   overflowWrap: "break-word",
// };

// export default DocumentViewer;



import React, { useEffect, useState } from "react";
import textFileIcon from "./assets/text-file-icon.svg";
import { apiService } from "./Apis/ApiService";

const DocumentViewer = () => {
  const [documents, setDocuments] = useState({});
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const storedUsername = localStorage.getItem("localStorageUsername");

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const response = await apiService.getDocuments(storedUsername);
        setDocuments(response.documentsData);
      } catch (error) {
        console.error("Failed to fetch documents:", error);
      }
    };

    if (storedUsername) {
      fetchDocs();
    }
  }, [storedUsername]);

  const decodeContent = (base64Content) => {
    try {
      if (base64Content && typeof base64Content === "string" && /^[A-Za-z0-9+/=]+$/.test(base64Content)) {
        return atob(base64Content); // Decode the base64 content to plain text
      } else {
        throw new Error("Invalid Base64 string");
      }
    } catch (error) {
      console.error("Error decoding content:", error);
      return "Invalid document content"; // Return a fallback message
    }
  };

  const handleDocumentClick = (docName, contentArray) => {
    const decodedContent = decodeContent(contentArray[0]);
    setSelectedDocument({ docName, content: decodedContent });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDocument(null);
  };

  return (
    <div style={containerStyle}>
      <div style={{ marginTop: "25px" }}></div>
      <div style={fileListStyle}>
        {Object.entries(documents).map(([docName, contentArray]) => (
          <div
            key={docName}
            style={fileRowStyle}
            onClick={() => handleDocumentClick(docName, contentArray)}
          >
            <img src={textFileIcon} alt="Text File Icon" style={fileIconStyle} />
            <p style={fileNameStyle}>{docName}</p>
            <p style={lastEditedStyle}>Last edited by Karuppusamy at 12:00:00</p>
          </div>
        ))}
      </div>

      {isModalOpen && selectedDocument && (
        <div style={modalStyle}>
          <div style={modalContentStyle}>
            <h3>{selectedDocument.docName}</h3>
            <div style={contentStyle}>{selectedDocument.content}</div>
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

const containerStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "20px",
};

const fileListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const fileRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "15px",
  padding: "10px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  cursor: "pointer",
  justifyContent: "space-between",
};

const fileIconStyle = {
  width: "20px",
  height: "20px",
};

const fileNameStyle = {
  flex: "1",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0",
};

const lastEditedStyle = {
  fontSize: "14px",
  color: "#666",
  margin: "0",
  whiteSpace: "nowrap",
};

const modalStyle = {
  position: "fixed",
  top: "0",
  left: "0",
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalContentStyle = {
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "8px",
  width: "80%",
  maxWidth: "600px",
  overflowY: "auto",
};

const contentStyle = {
  whiteSpace: "pre-wrap", // Maintain formatting (new lines, spaces)
  fontFamily: "monospace",
  fontSize: "14px",
  lineHeight: "1.5",
  color: "#333",
  overflowWrap: "break-word", // Ensure long words are wrapped correctly
};

export default DocumentViewer;
