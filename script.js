// --- Firebase SDKs ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// --- CONFIGURATION ---
// IMPORTANT: Replace with your LIVE keys and URLs before deploying
const FLUTTERWAVE_PUBLIC_KEY = "FLWPUBK-2d71f9db1cf9d5ea5ecec5a44ea56ca9-X"; // <-- REPLACE
const BACKEND_URL = "https://vendifi-backend-production.up.railway.app"; // Live backend on Railway
// const BACKEND_URL = "http://localhost:3000"; // Local backend (uncomment for local testing)

// Paste your Firebase config object directly here
const firebaseConfig = {
  apiKey: "AIzaSyCvZYr5AhP10nKSBpn96sGCBDic_fsS_dA",
  authDomain: "vendifi-96efe.firebaseapp.com",
  projectId: "vendifi-96efe",
  storageBucket: "vendifi-96efe.firebasestorage.app",
  messagingSenderId: "451052606895",
  appId: "1:451052606895:web:f83b8387c5e592d6184b5a"
};

// --- INITIALIZE FIREBASE ---
let app, auth;
try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
} catch(e) {
    console.error("Firebase initialization failed.", e);
}

// --- GLOBAL STATE ---
let currentTab = 'airtime';
let currentUser = null;

// --- DATA PLANS (Hardcoded for frontend) ---
// This map must correspond to the PRODUCT_CATALOG in your server.js
const dataPlans = {
    "MTN": [
        { id: "MTN-1GB-DAILY", text: "1GB Daily - ₦300", amount: 300 },
        { id: "MTN-500MB-MONTHLY", text: "500MB Monthly - ₦500", amount: 500 },
        { id: "MTN-1GB-WEEKLY", text: "1GB Weekly - ₦800", amount: 800 },
        { id: "MTN-1.5GB-MONTHLY", text: "1.5GB Monthly - ₦1200", amount: 1200 },
        { id: "MTN-2GB-MONTHLY", text: "2GB Monthly - ₦1500", amount: 1500 },
        { id: "MTN-3.2GB-MONTHLY", text: "3.2GB Monthly - ₦2000", amount: 2000 },
        { id: "MTN-6GB-WEEKLY", text: "6GB Weekly - ₦2500", amount: 2500 },
        { id: "MTN-7GB-MONTHLY", text: "7GB Monthly - ₦3500", amount: 3500 },
        { id: "MTN-100GB-MONTHLY", text: "100GB Monthly - ₦20000", amount: 20000 }
    ],
    "GLO": [
        { id: "GLO-1GB-DAILY", text: "1GB Daily - ₦350", amount: 350 },
        { id: "GLO-500MB-MONTHLY", text: "500MB Monthly - ₦500", amount: 500 },
        { id: "GLO-2GB-DAILY", text: "2GB Daily - ₦500", amount: 500 },
        { id: "GLO-1.5GB-MONTHLY", text: "1.5GB Monthly - ₦1000", amount: 1000 },
        { id: "GLO-2.6GB-MONTHLY", text: "2.6GB Monthly - ₦1000", amount: 1000 },
        { id: "GLO-7GB-WEEKLY", text: "7GB Weekly - ₦1500", amount: 1500 },
        { id: "GLO-3.2GB-MONTHLY", text: "3.2GB Monthly - ₦1600", amount: 1600 },
        { id: "GLO-10GB-MONTHLY", text: "10GB Monthly - ₦2500", amount: 2500 },
        { id: "GLO-50GB-MONTHLY", text: "50GB Monthly - ₦10000", amount: 10000 },
        { id: "GLO-107GB-MONTHLY", text: "107GB Monthly - ₦20000", amount: 20000 }
    ],
    "AIRTEL": [
        { id: "AIRTEL-1GB-DAILY", text: "1GB Daily - ₦300", amount: 300 },
        { id: "AIRTEL-500MB-MONTHLY", text: "500MB Monthly - ₦500", amount: 500 },
        { id: "AIRTEL-1GB-WEEKLY", text: "1GB Weekly - ₦800", amount: 800 },
        { id: "AIRTEL-1.5GB-MONTHLY", text: "1.5GB Monthly - ₦1200", amount: 1200 },
        { id: "AIRTEL-2GB-MONTHLY", text: "2GB Monthly - ₦1500", amount: 1500 },
        { id: "AIRTEL-3.5GB-WEEKLY", text: "3.5GB Weekly - ₦1500", amount: 1500 },
        { id: "AIRTEL-3.2GB-MONTHLY", text: "3.2GB Monthly - ₦2000", amount: 2000 },
        { id: "AIRTEL-8GB-MONTHLY", text: "8GB Monthly - ₦3000", amount: 3000 },
        { id: "AIRTEL-60GB-MONTHLY", text: "60GB Monthly - ₦15000", amount: 15000 },
        { id: "AIRTEL-100GB-MONTHLY", text: "100GB Monthly - ₦20000", amount: 20000 }
    ],
    "9MOBILE": [
        { id: "9MOBILE-1GB-DAILY", text: "1GB Daily - ₦300", amount: 300 },
        { id: "9MOBILE-500MB-MONTHLY", text: "500MB Monthly - ₦500", amount: 500 },
        { id: "9MOBILE-1.5GB-MONTHLY", text: "1.5GB Monthly - ₦1000", amount: 1000 },
        { id: "9MOBILE-2GB-MONTHLY", text: "2GB Monthly - ₦1000", amount: 1000 },
        { id: "9MOBILE-7GB-WEEKLY", text: "7GB Weekly - ₦1500", amount: 1500 },
        { id: "9MOBILE-3.2GB-MONTHLY", text: "3.2GB Monthly - ₦1500", amount: 1500 },
        { id: "9MOBILE-4.5GB-MONTHLY", text: "4.5GB Monthly - ₦2000", amount: 2000 },
        { id: "9MOBILE-11GB-MONTHLY", text: "11GB Monthly - ₦4000", amount: 4000 }
    ]
};

// --- CORE UI FUNCTIONS ---

/**
 * Switches the active service tab and updates UI colors.
 * @param {string} tabName - 'airtime', 'data', 'cable', or 'electricity'
 */
function switchTab(tabName) {
    currentTab = tabName;
    const forms = ['form-airtime', 'form-data', 'form-cable', 'form-electricity'];
    const tabs = ['tab-airtime', 'tab-data', 'tab-cable', 'tab-electricity'];
    const mainCard = document.getElementById('main-card');
    const payButton = document.getElementById('pay-button');
    const headerIcon = document.getElementById('header-icon');

    // Remove all active/bg classes
    mainCard.classList.remove('card-bg-airtime', 'card-bg-data', 'card-bg-cable', 'card-bg-electricity');
    payButton.classList.remove('bg-blue-600', 'bg-violet-600', 'bg-pink-600', 'bg-amber-500', 'hover:bg-blue-700', 'hover:bg-violet-700', 'hover:bg-pink-700', 'hover:bg-amber-600');
    headerIcon.classList.remove('text-blue-600', 'text-violet-600', 'text-pink-600', 'text-amber-500');

    tabs.forEach(tabId => {
        document.getElementById(tabId).classList.remove('tab-active-airtime', 'tab-active-data', 'tab-active-cable', 'tab-active-electricity');
        document.getElementById(tabId).classList.add('tab-inactive');
    });

    forms.forEach(formId => {
        document.getElementById(formId).classList.add('hidden');
    });

    // Add active classes for the selected tab
    document.getElementById(`form-${tabName}`).classList.remove('hidden');
    document.getElementById(`tab-${tabName}`).classList.add(`tab-active-${tabName}`);
    document.getElementById(`tab-${tabName}`).classList.remove('tab-inactive');
    
    mainCard.classList.add(`card-bg-${tabName}`);

    // Set button and icon colors
    let colorClass, hoverColorClass, textClass;
    switch (tabName) {
        case 'data':
            colorClass = 'bg-violet-600'; hoverColorClass = 'hover:bg-violet-700'; textClass = 'text-violet-600';
            break;
        case 'cable':
            colorClass = 'bg-pink-600'; hoverColorClass = 'hover:bg-pink-700'; textClass = 'text-pink-600';
            break;
        case 'electricity':
            colorClass = 'bg-amber-500'; hoverColorClass = 'hover:bg-amber-600'; textClass = 'text-amber-500';
            break;
        case 'airtime':
        default:
            colorClass = 'bg-blue-600'; hoverColorClass = 'hover:bg-blue-700'; textClass = 'text-blue-600';
            break;
    }
    payButton.classList.add(colorClass, hoverColorClass);
    headerIcon.classList.add(textClass);
}

/**
 * Populates the data plan dropdown based on the selected network.
 */
function updateDataPlans() {
    const network = document.getElementById('data-network').value;
    const planSelect = document.getElementById('data-plan');
    const plans = dataPlans[network] || [];

    planSelect.innerHTML = ''; // Clear existing options

    if (plans.length === 0) {
        planSelect.innerHTML = '<option value="">No plans available</option>';
        return;
    }

    plans.forEach(plan => {
        const option = document.createElement('option');
        option.value = plan.id;
        option.textContent = plan.text;
        option.dataset.amount = plan.amount;
        planSelect.appendChild(option);
    });
}

// --- MODAL FUNCTIONS ---

/**
 * Displays a custom modal.
 * @param {string} title - The title of the modal.
 * @param {string} message - The body text of the modal.
 * @param {'success'|'error'|'loading'|'info'} type - The type of modal to show.
 */
function showModal(title, message, type = 'info') {
    const modal = document.getElementById('status-modal');
    const content = document.getElementById('modal-content');
    let iconHtml = '';

    switch (type) {
        case 'success':
            iconHtml = `<svg class="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
            break;
        case 'error':
            iconHtml = `<svg class="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
            break;
        case 'loading':
            iconHtml = `<div class="loader mx-auto"></div>`;
            break;
        case 'info':
        default:
            iconHtml = `<svg class="w-16 h-16 text-blue-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
            break;
    }

    content.innerHTML = `
        ${iconHtml}
        <h3 class="text-xl font-bold">${title}</h3>
        <p class="text-sm text-gray-600">${message}</p>
    `;
    modal.classList.remove('hidden');
}

/**
 * Closes any active modal.
 * @param {string} modalId - The ID of the modal to close.
 */
function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
    // Clear content of status modal on close
    if (modalId === 'status-modal') {
        document.getElementById('modal-content').innerHTML = '';
    }
}

/**
 * Shows the modal for checking transaction status.
 */
function showStatusChecker(event) {
    event.preventDefault(); // Prevent default link behavior
    document.getElementById('status-checker-modal').classList.remove('hidden');
}

/**
 * Shows the login or signup modal.
 * @param {'login'|'signup'} modalType 
 */
function showAuthModal(modalType) {
    if (modalType === 'login') {
        document.getElementById('login-modal').classList.remove('hidden');
    } else {
        document.getElementById('signup-modal').classList.remove('hidden');
    }
}

// --- PAYMENT & BACKEND LOGIC ---

/**
 * Gathers all transaction details from the active form.
 * @returns {object|null} A details object or null if validation fails.
 */
function getTransactionDetails() {
    const email = document.getElementById('customer-email').value.trim();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
        showModal('Invalid Input', 'Please enter a valid email address.', 'error');
        return null;
    }

    let details = { email, amount: 0, meta: { service: currentTab } };

    if (currentTab === 'airtime') {
        details.amount = parseInt(document.getElementById('airtime-amount').value, 10);
        details.meta.network = document.getElementById('airtime-network').value;
        details.meta.phone = document.getElementById('airtime-phone').value;
        if (!details.meta.phone || details.meta.phone.length < 11 || !details.amount || details.amount < 50) {
            showModal('Invalid Input', 'Please check phone number and amount (min ₦50).', 'error'); return null;
        }
    } else if (currentTab === 'data') {
        const planSelect = document.getElementById('data-plan');
        const selectedOption = planSelect.options[planSelect.selectedIndex];
        details.amount = parseInt(selectedOption.dataset.amount, 10);
        details.meta.planId = selectedOption.value;
        details.meta.network = document.getElementById('data-network').value;
        details.meta.phone = document.getElementById('data-phone').value;
         if (!details.meta.phone || details.meta.phone.length < 11 || !details.amount) {
            showModal('Invalid Input', 'Please check phone number and select a valid data plan.', 'error'); return null;
        }
    } else if (currentTab === 'cable') {
        details.amount = parseInt(document.getElementById('cable-amount').value, 10);
        details.meta.provider = document.getElementById('cable-provider').value;
        details.meta.smartCard = document.getElementById('cable-card-number').value;
        if (!details.meta.smartCard || !details.amount || details.amount < 100) {
            showModal('Invalid Input', 'Please check smart card number and package amount.', 'error'); return null;
        }
    } else if (currentTab === 'electricity') {
        details.amount = parseInt(document.getElementById('electricity-amount').value, 10);
        details.meta.disco = document.getElementById('electricity-disco').value;
        details.meta.meterType = document.getElementById('electricity-meter-type').value;
        details.meta.meterNumber = document.getElementById('electricity-meter-number').value;
        if (!details.meta.meterNumber || !details.amount || details.amount < 1000) {
            showModal('Invalid Input', 'Please check meter number and amount (min ₦1000).', 'error'); return null;
        }
    }
    return details;
}

/**
 * Initiates the Flutterwave payment modal.
 */
function initiatePayment() {
    const details = getTransactionDetails();
    if (!details) return; // Validation failed
    
    if (!FLUTTERWAVE_PUBLIC_KEY || FLUTTERWAVE_PUBLIC_KEY.includes("xxxxxxxx")) {
        showModal("Configuration Error", "Payment gateway is not configured. Please contact support.", 'error'); 
        return;
    }
    
    // Generate a unique transaction reference
    const tx_ref = 'VENDIFI-' + Date.now() + '-' + Math.floor((Math.random() * 1000000));

    FlutterwaveCheckout({
        public_key: FLUTTERWAVE_PUBLIC_KEY,
        tx_ref: tx_ref,
        amount: details.amount,
        currency: 'NGN',
        payment_options: "card, ussd, banktransfer",
        customer: {
            email: details.email,
            phone_number: details.meta.phone || '', // Use phone from meta if available
        },
        meta: details.meta, // Pass all our service metadata to Flutterwave
        customizations: {
            title: "Vendifi",
            description: "Instant Airtime, Data, & Bill Payments",
            logo: "https://placehold.co/100x100/3b82f6/white?text=V", // Placeholder logo
        },
        callback: function(response) {
            console.log("Flutterwave callback response:", response);
            // Verify the transaction only if successful
            if (response.status === "successful" || response.status === "completed") {
                verifyPaymentAndDeliver(response.tx_ref);
            } else {
                showModal('Payment Failed', 'Your payment was not successful. Please try again.', 'error');
            }
        },
        onclose: function() {
            console.log('Payment window closed.');
        }
    });
}

/**
 * Sends the transaction reference to the backend for verification and fulfillment.
 * @param {string} reference - The transaction reference.
 */
async function verifyPaymentAndDeliver(reference) {
    showModal('Processing...', 'We are verifying your payment and delivering your service. Please wait.', 'loading');
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/process-transaction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reference: reference })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            showModal('Purchase Successful!', result.message, 'success');
        } else {
            showModal('Transaction Failed', result.message || 'An unknown error occurred.', 'error');
        }
    } catch (error) {
        console.error('Verification Error:', error);
        showModal('Network Error', 'Could not connect to the server. Please check your internet connection or try again later.', 'error');
    }
}

/**
 * Fetches the status of a transaction from the backend.
 */
async function checkOrderStatus() {
    const reference = document.getElementById('status-ref-input').value;
    if (!reference) {
        showModal('Invalid Input', 'Please enter a transaction reference.', 'error');
        return;
    }
    
    closeModal('status-checker-modal');
    showModal('Checking Status...', `Checking status for ${reference}. Please wait.`, 'loading');

    try {
        const response = await fetch(`${BACKEND_URL}/api/check-status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reference: reference })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showModal('Transaction Status', `Status for ${reference}: <strong>${result.status}</strong>. ${result.message}`, 'info');
        } else {
            showModal('Error', result.message || 'Could not retrieve status for that transaction.', 'error');
        }
    } catch (error) {
        console.error('Status Check Error:', error);
        showModal('Network Error', 'Could not connect to the server. Please check your internet connection.', 'error');
    }
}

// --- FIREBASE AUTH FUNCTIONS ---

function signupUser() {
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    if (!email || !password) {
        showModal('Error', 'Please enter both email and password.', 'error'); return;
    }
    
    showModal('Signing Up...', 'Creating your account.', 'loading');
    
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            closeModal('signup-modal');
            showModal('Success!', 'Your account has been created.', 'success');
        })
        .catch((error) => {
            showModal('Signup Failed', error.message, 'error');
        });
}

function loginUser() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    if (!email || !password) {
        showModal('Error', 'Please enter both email and password.', 'error'); return;
    }
    
    showModal('Logging In...', 'Please wait.', 'loading');
    
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            closeModal('login-modal');
            showModal('Welcome Back!', 'You are now logged in.', 'success');
        })
        .catch((error) => {
            showModal('Login Failed', error.message, 'error');
        });
}

function logoutUser() {
    signOut(auth).then(() => {
        showModal('Logged Out', 'You have been successfully logged out.', 'info');
    }).catch((error) => {
        showModal('Error', 'Could not log you out. Please try again.', 'error');
    });
}

// --- INITIALIZATION ---

// Listen for auth state changes
if (auth) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            currentUser = user;
            document.getElementById('logged-in-view').classList.remove('hidden');
            document.getElementById('logged-in-view').classList.add('flex');
            document.getElementById('logged-out-view').classList.add('hidden');
            document.getElementById('user-email-display').textContent = user.email;
            document.getElementById('customer-email').value = user.email; // Auto-fill email
            document.getElementById('customer-email').readOnly = true;
        } else {
            // User is signed out
            currentUser = null;
            document.getElementById('logged-in-view').classList.add('hidden');
            document.getElementById('logged-in-view').classList.remove('flex');
            document.getElementById('logged-out-view').classList.remove('hidden');
            document.getElementById('user-email-display').textContent = '';
            document.getElementById('customer-email').value = ''; // Clear email field
            document.getElementById('customer-email').readOnly = false;
        }
    });
}

// --- GLOBAL EVENT HANDLERS ---
// Manually attach functions to the window object
// so that inline onclick="" attributes in index.html can find them.
window.switchTab = switchTab;
window.updateDataPlans = updateDataPlans;
window.initiatePayment = initiatePayment;
window.showModal = showModal;
window.closeModal = closeModal;
window.showStatusChecker = showStatusChecker;
window.checkOrderStatus = checkOrderStatus;
window.showAuthModal = showAuthModal;
window.loginUser = loginUser;
window.signupUser = signupUser;
window.logoutUser = logoutUser;

// --- PAGE LOAD INITIALIZATION ---
// Add a DOMContentLoaded listener to set up the page
document.addEventListener('DOMContentLoaded', () => {
    switchTab('airtime'); // Set the initial active tab
    updateDataPlans();    // Populate the data plans for the default network
});

