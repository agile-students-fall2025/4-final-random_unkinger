import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginSignup.css";


const LoginSignup = () => {
 const [action, setAction] = useState("Login");
 const [showReset, setShowReset] = useState(false);
 const [resetEmail, setResetEmail] = useState("");
 const navigate = useNavigate();


 // Handle forgot password request (mock)
 const handleReset = () => {
   if (!resetEmail.trim()) {
     alert("Please enter a valid email address.");
     return;
   }
   alert(`Reset link sent to ${resetEmail} (mock).`);
   setShowReset(false);
   setResetEmail("");
 };


 return (
   <div>
     <div className="welcome-text">Welcome to NutriLens!</div>


     <div className="container">
       <div className="header">
         <div className="text">
           {showReset ? "Forgot your password" : action}
         </div>
         <div className="underline"></div>
       </div>


       {/* ============ Forgot Password Popup ============ */}
       {showReset ? (
         <div className="forgot-container">
           <p className="forgot-paragraph">
             Please enter the email address you'd like your password reset
             information sent to:
           </p>
           <div className="input">
             <i className="ri-mail-fill"></i>
             <input
               type="email"
               placeholder="Enter your email"
               value={resetEmail}
               onChange={(e) => setResetEmail(e.target.value)}
             />
           </div>


           <button className="submit" onClick={handleReset}>
             Request reset link
           </button>


           <div
             className="back-link"
             onClick={() => {
               setShowReset(false);
               setAction("Login");
             }}
           >
             ← Back To Login
           </div>
         </div>
       ) : (
         /* ============ Regular Login / Signup ============ */
         <>
           <div className="inputs">
             {action === "Login" ? (
               <div></div>
             ) : (
               <div className="input">
                 <i className="ri-user-fill"></i>
                 <input type="text" placeholder="username" />
               </div>
             )}
             <div className="input">
               <i className="ri-mail-fill"></i>
               <input type="email" placeholder="email" />
             </div>
             <div className="input">
               <i className="ri-lock-fill"></i>
               <input type="password" placeholder="password" />
             </div>
           </div>


           {action === "Sign Up" ? (
             <div></div>
           ) : (
             <div className="forgot-password">
               Forgot Password?{" "}
               <span onClick={() => setShowReset(true)}>Click Here!</span>
             </div>
           )}


           <div className="submit-container">
             <div
               className={action === "Login" ? "submit gray" : "submit"}
               onClick={() => setAction("Sign Up")}
             >
               Sign Up
             </div>
             <div
               className={action === "Sign Up" ? "submit gray" : "submit"}
               onClick={() => {
                 if (action === "Login") {
                   navigate("/home");
                 } else {
                   setAction("Login");
                 }
               }}
             >
               Login
             </div>
           </div>
         </>
       )}
     </div>
   </div>
 );
};


export default LoginSignup;
