import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Quagga from "@ericblade/quagga2";
import "../LoginSignup/LoginSignup.css";
import "./ScanMeal.css";
import NavBar from "../NavBar/NavBar";

const ScanMeal = () => {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [scanStatus, setScanStatus] = useState(false);
  const [barcode, setBarcode] = useState(null);
  const navigate = useNavigate();

  const startScanning = React.useCallback(() => {
    if (!videoRef.current) {
      console.log("Video reference not available");
      return;
    }

    if (videoRef.current.videoWidth === 0) {
      console.log("Video not ready yet, waiting...");
      setTimeout(startScanning, 500);
      return;
    }

    // clean up any existing scan instances first
    try {
      Quagga.stop();
    } catch (e) {}

    const constraints = {
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: videoRef.current,
        constraints: {
          width: { min: 640 },
          height: { min: 480 },
          facingMode: "environment",
          aspectRatio: { min: 1, max: 2 },
        },
      },
      locator: {
        patchSize: "medium",
        halfSample: true,
      },
      numOfWorkers: 2, // can reduce for btr compatibility
      frequency: 10,
      decoder: {
        readers: [
          "code_128_reader",
          "ean_reader",
          "ean_8_reader",
          "code_39_reader",
          "code_39_vin_reader",
          "codabar_reader",
          "upc_reader",
          "upc_e_reader",
          "i2of5_reader",
        ],
      },
      locate: true,
    };

    try {
      Quagga.init(constraints, (err) => {
        if (err) {
          console.error("Quagga init error:", err);
          setError("Failed to initialize barcode scanner. Please try again.");
          setScanStatus(false);
          return;
        }

        Quagga.onDetected((result) => {
          if (!result || !result.codeResult) {
            console.log("Invalid detection result");
            return;
          }

          const code = result.codeResult.code;
          console.log("Barcode detected:", code);
          setBarcode(code);

          // stop and auto move on after detecting barcode
          Quagga.stop();
          setScanStatus(false);
          navigate("/edit-meal", { state: { barcode: code } });
        });

        // log every time frame is processed to the console
        Quagga.onProcessed((result) => {
          if (result) {
            if (Math.random() < 0.05) {
              console.log("Frame processed");
            }
          }
        });

        // start scanning
        Quagga.start();
        setScanStatus(true);
        console.log("Barcode scanner started");
      });
    } catch (e) {
      console.error("Exception during Quagga setup:", e);
      setError("Failed to setup barcode scanner: " + e.message);
    }
  }, [navigate]);

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
            // start scan as soon as video comes
            videoRef.current.onloadeddata = () => {
              // delayed to make sure video is ready
              setTimeout(startScanning, 2000);
            };
          }
        } catch (err) {
          console.log("Camera access error", err);
          setError("Could not access camera! Please grant permission!");
        }
      } else {
        setError("Browser does not support camera access");
      }
    };

    getCamPermission();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (scanStatus) {
        Quagga.stop();
      }
    };
  }, [startScanning]);

  // TODO might need to remove this manual add option
  const handleAddClick = () => {
    navigate("/edit-meal");
  };

  return (
    <div className="scan-meal-page">
      <div className="container">
        <button
          onClick={() => navigate(-1)}
          className="back-button"
          aria-label="Back"
        >
          <i className="ri-arrow-left-line"></i>
        </button>
        <div className="text">Scan Meal</div>
        <div className="underline"></div>
        <div className="camera-container">
          {error ? (
            <div className="error-message">{error}</div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="camera-feed"
            />
          )}
        </div>
        <div className="submit-container">
          <button className="submit" onClick={handleAddClick}>
            + Add Meal
          </button>
        </div>
      </div>
      <NavBar />
    </div>
  );
};

export default ScanMeal;
