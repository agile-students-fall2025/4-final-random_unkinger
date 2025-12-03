import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Quagga from "@ericblade/quagga2";
import "../LoginSignup/LoginSignup.css";
import "./ScanMeal.css";
import NavBar from "../NavBar/NavBar";

const ScanMeal = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);
  const [scanStatus, setScanStatus] = useState(false);
  const [barcode, setBarcode] = useState(null);
  const [lightingFeedback, setLightingFeedback] = useState(null);
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

  // Analyze lighting conditions from video feed
  const analyzeLighting = React.useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Only analyze if video is ready
    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      return;
    }

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Sample pixels from the center region (where barcode is likely to be)
    const centerX = Math.floor(canvas.width / 2);
    const centerY = Math.floor(canvas.height / 2);
    const sampleSize = Math.min(canvas.width, canvas.height) * 0.3;
    const startX = Math.max(0, centerX - sampleSize / 2);
    const startY = Math.max(0, centerY - sampleSize / 2);
    const endX = Math.min(canvas.width, centerX + sampleSize / 2);
    const endY = Math.min(canvas.height, centerY + sampleSize / 2);

    // Get image data from center region
    const imageData = ctx.getImageData(startX, startY, endX - startX, endY - startY);
    const data = imageData.data;

    // Calculate average brightness (luminance)
    let totalBrightness = 0;
    let pixelCount = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Calculate luminance using standard formula
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      totalBrightness += brightness;
      pixelCount++;
    }

    const averageBrightness = totalBrightness / pixelCount;

    // Determine lighting feedback
    // Brightness range: 0-255
    // Too dark: < 50
    // Too light: > 200
    // Good: 50-200
    if (averageBrightness < 50) {
      setLightingFeedback("too dark");
    } else if (averageBrightness > 200) {
      setLightingFeedback("too light");
    } else {
      setLightingFeedback("good");
    }
  }, []);

  // Monitor lighting conditions periodically
  useEffect(() => {
    if (!scanStatus || !videoRef.current) {
      return;
    }

    const interval = setInterval(() => {
      analyzeLighting();
    }, 500); // Check every 500ms

    return () => clearInterval(interval);
  }, [scanStatus, analyzeLighting]);

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
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="camera-feed"
              />
              <canvas ref={canvasRef} style={{ display: "none" }} />
              {lightingFeedback && (
                <div className={`lighting-feedback ${lightingFeedback}`}>
                  {lightingFeedback === "too dark" && (
                    <span>⚠️ Too Dark - Move to a brighter area</span>
                  )}
                  {lightingFeedback === "too light" && (
                    <span>⚠️ Too Bright - Reduce glare or move to a darker area</span>
                  )}
                  {lightingFeedback === "good" && (
                    <span>✓ Good Lighting</span>
                  )}
                </div>
              )}
            </>
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
