import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiService } from "../Apis/ApiService.jsx";

const GrantedDocumentAccessor = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // State to control the popup visibility and capture the input
  const [showPopup, setShowPopup] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const urlParams = new URLSearchParams(location.search);
      const savedDocContent = urlParams.get('savedDocContent');
      const savedDocName = urlParams.get('savedDocName');

      const localStorageUsername = localStorage.getItem('localStorageUsername');
      console.log("Username accessing the document:", localStorageUsername);

      try {
        // Await the response from the permission check
        const response = await apiService.hasAccessPermission(localStorageUsername, decodeURIComponent(savedDocName));
        console.log(response); // Log the response to check the result

        if (response.result) {  // Assuming response.result indicates permission
          if (savedDocContent && savedDocName) {
            const decodedContent = decodeURIComponent(savedDocContent);
            const decodedDocName = decodeURIComponent(savedDocName);

            localStorage.setItem("editorDocName", decodedDocName);
            localStorage.setItem("editorDocContent", decodedContent);
            navigate("/editor"); // Navigate to the editor if permission granted
          } else {
            console.error("Invalid parameters");
          }
        } else {
          console.error("User doesn't have permission to view the document.");
          // Show the popup instead of navigating away
          setShowPopup(true);
        }
      } catch (error) {
        console.error("Error checking access permission:", error);
      }
    };

    fetchData(); // Call the async function within useEffect

  }, [location, navigate]);

  // Function to handle reason input change
  const handleReasonChange = (e) => {
    setReason(e.target.value);
  };

  // Function to submit the reason (e.g., you can send it to the backend or handle accordingly)
  const handleSubmitReason = () => {
    console.log("Reason for requesting access:", reason);
    // Handle submitting the reason, for example, via an API call
    // After submitting, close the popup
    setShowPopup(false);
  };

  return (
    <div>
      <h1>Loading document...</h1>

      {/* Popup for access denial */}
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>You don't have permission to view this document since it is protected.</h2>
            <textarea 
              placeholder="Why do you need access?" 
              value={reason}
              onChange={handleReasonChange}
              rows={4}
              cols={50}
            />
            <div>
              <button onClick={handleSubmitReason}>Submit</button>
              <button onClick={() => setShowPopup(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrantedDocumentAccessor;
