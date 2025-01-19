import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import { apiService } from "../Apis/ApiService.jsx";

const GrantedDocumentAccessor = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const hasAccess = params.get("hasAccess");
    console.log(hasAccess);
    if(hasAccess==="false" || hasAccess===false){
      console.log("falseeeeeeeeeeeee")
    
    }
    if (token) {
      try {
        const encryptionKey = "karuppusamy";
        const decryptedData = CryptoJS.AES.decrypt(token, encryptionKey).toString(CryptoJS.enc.Utf8);

        if (!decryptedData) {
          throw new Error("Decryption failed or result is empty.");
        }

        const [author, documentName, email] = decryptedData.split("/");

        if (!author || !documentName || !email) {
          throw new Error("Decrypted data format is incorrect.");
        }

        const fetchDocumentDetails = async () => {
          try {
            const response = await apiService.readEnabledDocument({ author, documentName, email });
            const { documentName: docName, docContent } = response;

            if (!docName || !docContent) {
              throw new Error("Document details are incomplete.");
            }

            const decodedContent = decodeContent(docContent);

            localStorage.setItem("editorDocName", docName);
            localStorage.setItem("editorDocContent", decodedContent);
            navigate("/editor");
          } catch (error) {
            console.error("Error fetching document details:", error);
          }
        };

        fetchDocumentDetails();
      } catch (error) {
        console.error("Error processing token or decrypted data:", error);
      }
    }
  }, [location, navigate]);

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
    <div>
      <h1></h1>
    </div>
  );
};

export default GrantedDocumentAccessor;
