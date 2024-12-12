import React from "react";
import { loginWithGoogle } from "@/app/auth-functions";

const GoogleLoginButton: React.FC = () => {
    const handleGoogleLogin = async () => {
        try {
            const userCredential = await loginWithGoogle();
            console.log("Logged in user:", userCredential.user);
            // Save user info or navigate to a new page
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    return (
        <button onClick={handleGoogleLogin} style={{ padding: "10px 20px", backgroundColor: "#4285F4", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
            Sign in with Google
        </button>
    );
};

export default GoogleLoginButton;
