/**
 * VENDIFI Frontend Configuration
 * 
 * Update these values for your deployment:
 * 1. BACKEND_URL - Your Railway backend URL
 * 2. Firebase config - From Firebase Console
 * 3. Flutterwave key - From Flutterwave Dashboard
 */

// ==================================
// BACKEND API CONFIGURATION
// ==================================

// Development (Local)
// const BACKEND_URL = "http://localhost:3000";

// Production (Railway)
const BACKEND_URL = "https://vendifi-backend-production.up.railway.app";

// ==================================
// FIREBASE CONFIGURATION
// ==================================
const firebaseConfig = {
  apiKey: "AIzaSyCvZYr5AhP10nKSBpn96sGCBDic_fsS_dA",
  authDomain: "vendifi-96efe.firebaseapp.com",
  projectId: "vendifi-96efe",
  storageBucket: "vendifi-96efe.firebasestorage.app",
  messagingSenderId: "451052606895",
  appId: "1:451052606895:web:f83b8387c5e592d6184b5a"
};

// ==================================
// FLUTTERWAVE CONFIGURATION
// ==================================
const FLUTTERWAVE_PUBLIC_KEY = "FLWPUBK-2d71f9db1cf9d5ea5ecec5a44ea56ca9-X";

// ==================================
// EXPORT FOR USE IN APP
// ==================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BACKEND_URL,
        firebaseConfig,
        FLUTTERWAVE_PUBLIC_KEY
    };
}
