import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiService } from "../Apis/ApiService.jsx";
import '../css/GrantedDocumentAccessor.css';

const GrantedDocumentAccessor = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [showPopup, setShowPopup] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const urlParams = new URLSearchParams(location.search);
      const savedDocContent = urlParams.get('savedDocContent') || '';
      const savedDocName = urlParams.get('savedDocName') || ''; 

      const localStorageUsername = localStorage.getItem('localStorageUsername') || '';
      console.log("Username accessing the document:", localStorageUsername);

      try {
        const response = await apiService.hasAccessPermission(localStorageUsername, decodeURIComponent(savedDocName));
        console.log(response); 
        if (response.result) {  
          if (savedDocContent && savedDocName) {
            const decodedContent = decodeURIComponent(savedDocContent);
            const decodedDocName = decodeURIComponent(savedDocName);

            localStorage.setItem("editorDocName", decodedDocName);
            localStorage.setItem("editorDocContent", decodedContent);
            navigate("/editor"); 
          } else {
            console.error("Invalid parameters");
          }
        } else {
          console.error("User doesn't have permission to view the document.");
          setShowPopup(true);
        }
      } catch (error) {
        console.error("Error checking access permission:", error);
      }
    };

    fetchData(); 

  }, [location, navigate]);

  const handleReasonChange = (e) => {
    setReason(e.target.value);
  };

  const handleSubmitReason = () => {
    console.log("Reason for requesting access:", reason);
    setShowPopup(false);
  };

  return (
    <div className="container">
      <h1>Loading document...</h1>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>Access Denied</h2>
            <p className="popup-message">You don't have permission to view this document because it is protected.</p>
            <textarea 
              placeholder="Why do you need access?" 
              value={reason}
              onChange={handleReasonChange}
              rows={4}
              cols={50}
              className="reason-textarea"
            />
            <div className="popup-actions">
              <button className="submit-btn" onClick={handleSubmitReason}>Submit</button>
              <button className="close-btn" onClick={() => setShowPopup(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrantedDocumentAccessor;
