import React, { useState, useEffect, useRef } from "react";
import '../LoginSignup/LoginSignup.css';
import "./ScanMeal.css";

const ScanMeal = () => {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let stream = null;
    const getCamPermission = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.log("BRO GIVE ME CAMERA PERMISSION!!", err);
          setError("Could not access camera! Please grant permission!");
        }
      } else {
        setError("Browser does not support camera access");
      }
    };

    getCamPermission();

    return () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop())
        }
    }
  }, []);

  // TODO : HANDLE CLICK OF SCANNED IMAGE
  const handleAddClick = () => {
    console.log("Add Meal button is clicked plz navigate")
  }


  return (
    <div className="scan-meal-page">
        <div className="container">
            <div className="text">Scan Meal</div>
            <div className="underline"></div>
        <div className="camera-container">
            {error ?(
                <div className="error-message">{error}</div>
            ) : (
                <video ref={videoRef} autoPlay playsInline className="camera-feed"/>
            )}
        </div>
        <div className="submit-container">
            <button className="submit" onClick={handleAddClick}>+ Add Meal</button>
        </div>
        </div>
    </div>
  )



};

export default ScanMeal;
