import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js"; 
import { apiService } from "../Apis/ApiService.jsx";

const GrantedDocumentAccessor = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const savedDocContent = urlParams.get('savedDocContent');
    const savedDocName = urlParams.get('savedDocName');

    if (savedDocContent && savedDocName) {
      const decodedContent = decodeURIComponent(savedDocContent);
      const decodedDocName = decodeURIComponent(savedDocName);

      localStorage.setItem("editorDocName", decodedDocName);
      localStorage.setItem("editorDocContent", decodedContent);
      navigate("/editor");
    } else {
      console.error("Invalid parameters");
    }
  }, [location, navigate]);

  return (
    <div>
      <h1>Loading document...</h1>
    </div>
  );
};

export default GrantedDocumentAccessor;
