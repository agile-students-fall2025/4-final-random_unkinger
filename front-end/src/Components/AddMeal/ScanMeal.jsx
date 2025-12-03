import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Quagga from "@ericblade/quagga2";
import NavBar from "../NavBar/NavBar";

const API = process.env.REACT_APP_API_URL || "http://localhost:5050";

const ScanMeal = () => {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [scanStatus, setScanStatus] = useState(false);
  const [barcode, setBarcode] = useState(null);
  const navigate = useNavigate();

  const startScanning = useCallback(() => {
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
    } catch (e) {
      // ignore
    }

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
      numOfWorkers: 2,
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

        Quagga.onProcessed((result) => {
          if (result && Math.random() < 0.05) {
            console.log("Frame processed");
          }
        });

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
            videoRef.current.onloadeddata = () => {
              setTimeout(startScanning, 2000);
            };
          }
        } catch (err) {
          console.log("Camera access error", err);
          setError("Could not access camera. Please grant permission.");
        }
      } else {
        setError("Browser does not support camera access.");
      }
    };

    getCamPermission();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      try {
        Quagga.stop();
      } catch (e) {
        // ignore
      }
    };
  }, [startScanning]);

  const handleAddClick = () => {
    navigate("/edit-meal");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 flex flex-col dark:bg-gray-900 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="px-4 sm:px-6 pt-4 pb-3 border-b border-emerald-100/70 bg-white/60 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center rounded-full border border-emerald-100 bg-white/90 px-2.5 py-1.5 shadow-sm hover:bg-emerald-50 text-emerald-700 transition"
            aria-label="Back"
            type="button"
          >
            <i className="ri-arrow-left-line text-lg" />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
              NutriLens
            </span>
            <h1 className="mt-1 text-sm font-semibold text-emerald-900">
              Scan meal
            </h1>
          </div>
          <div className="w-9" />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 sm:px-6 pt-4 pb-24 space-y-4">
        {/* Camera card */}
        <section className="bg-white/80 backdrop-blur-md border border-emerald-100 rounded-3xl shadow-sm p-4 sm:p-5 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold text-emerald-900">
                Scan a barcode
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Point your camera at the barcode on the package.
              </p>
            </div>
            {scanStatus && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-100">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Scanning…
              </span>
            )}
          </div>

          <div className="mt-3 rounded-3xl border border-slate-200 bg-slate-900 overflow-hidden relative aspect-[3/4] flex items-center justify-center">
            {error ? (
              <div className="px-4 text-center text-xs text-amber-100">
                {error}
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="h-full w-full object-cover"
                />
                {/* Overlay frame */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="h-40 w-56 border-2 border-emerald-300/90 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
                </div>
                <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                  <p className="px-3 py-1.5 rounded-full bg-black/60 text-[10px] text-slate-100">
                    Align the barcode inside the frame
                  </p>
                </div>
              </>
            )}
          </div>

          {barcode && !error && (
            <p className="mt-2 text-[11px] text-slate-500">
              Last detected barcode:{" "}
              <span className="font-mono text-emerald-700">{barcode}</span>
            </p>
          )}
        </section>

        {/* Manual add button */}
        <section className="flex justify-center">
          <button
            type="button"
            onClick={handleAddClick}
            className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 transition"
          >
            + Add meal manually
          </button>
        </section>
      </main>

      <NavBar />
    </div>
  );
};

export default ScanMeal;