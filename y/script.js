// Import Firebase modules from the CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { getFirestore, collection, doc, getDoc, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// DOM Elements
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const submitButton = document.getElementById('submit');
const cancelButton = document.getElementById('cancel');
const chatContainer = document.querySelector('.chat-container');
const loginContainer = document.querySelector('.login-container');
const errorMessage = document.getElementById('error-message');

// Firebase configuration and initialization
const firebaseConfig = {
    apiKey: "AIzaSyCcD0Jex1VBVf5Ro6NJ1WqzQpFqg6bg5Q8",
    authDomain: "generative-info-system.firebaseapp.com",
    projectId: "generative-info-system",
    storageBucket: "generative-info-system.firebasestorage.app",
    messagingSenderId: "156890790642",
    appId: "1:156890790642:web:9486ede5d79a2a9e252e6b",
    measurementId: "G-J5QCS3XZ21"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig); 
const auth = getAuth(app);
const db = getFirestore(app);

// Event Listeners
document.getElementById('login-form').addEventListener('submit', handleSubmit);
cancelButton.addEventListener('click', function () {
    usernameInput.value = '';
    passwordInput.value = '';
});

// Handle Login Submission
function handleSubmit(event) {
    event.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (username.length === 0 || password.length === 0) {
        errorMessage.innerText = 'Please fill in all fields';
        errorMessage.style.display = 'block';
        return;
    }

    // Sign in with email and password
    signInWithEmailAndPassword(auth, username, password)
        .then((userCredential) => {
            // Signed in successfully
            chatContainer.style.display = 'block';
            loginContainer.style.display = 'none';
            errorMessage.style.display = 'none';
        })
        .catch((error) => {
            let errorMessageText = 'Invalid username or password';

            if (error.code === 'auth/user-not-found') {
                errorMessageText = 'No user found with this email.';
            } else if (error.code === 'auth/wrong-password') {
                errorMessageText = 'Incorrect password. Please try again.';
            }

            console.error("Error during sign-in:", error.message); 
            errorMessage.innerText = errorMessageText;
            errorMessage.style.display = 'block';
        });
}

// Chat functionality
const chatForm = document.getElementById('chat-form');
chatForm.addEventListener('submit', handleChatSubmit);

function handleChatSubmit(event) {
    event.preventDefault();
    const userInput = document.getElementById('input').value.trim();

    if (userInput.length === 0) {
        return; // Don't send an empty message
    }

    displayMessage(userInput, 'user');
    fetchInfo(userInput);
    document.getElementById('input').value = '';
}

// Fetch response from Hugging Face
async function fetchHuggingFaceResponse(userInput) {
    try {
        const response = await fetch('https://api-inference.huggingface.co/models/gpt2', { // Use a real model like GPT-2
            method: 'POST',
            headers: {
                'Authorization': `Bearer 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`,  // Your actual Hugging Face API token
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: userInput,  // The model expects a field called 'inputs'
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error Response:', errorText);  // Log the error message
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Response Data:', data);  // Debugging output

        return data[0]?.generated_text || "Sorry, I couldn't understand that.";
    } catch (error) {
        console.error('Error fetching Hugging Face response:', error);
        return "There was an error while processing your request.";
    }
}

async function fetchInfo(userInput) {
    const normalizedInput = userInput.toLowerCase();
    let responseMessage = "";

    // Check for courses related query
    if (normalizedInput.includes("courses")) {
        fetchCourses();
    }
    // Check for general university info query
    else if (normalizedInput.includes("university")) {
        fetchUniversityInfo("overview", "Sorry, I couldn't find that information.");
    }
    // Otherwise, call Hugging Face API to get a response from a model
    else {
        responseMessage = await fetchHuggingFaceResponse(normalizedInput);
        setTimeout(() => {
            displayMessage(responseMessage, 'bot');
        }, 1000);
    }
}

// Function to fetch courses for a given department
function fetchCourses(departmentName) {
    if (!departmentName || typeof departmentName !== 'string') {
        console.log("Invalid department name or empty string");
        displayMessage("Please specify a valid department.", 'bot');
        return;
    }

    // Normalize department name to ensure case insensitivity
    const normalizedDepartmentName = departmentName.trim().toUpperCase();
    console.log("Fetching courses for department:", normalizedDepartmentName);

    // Firestore reference for the dynamic department
    const departmentRef = doc(db, "departments", normalizedDepartmentName);
    console.log("Firestore Reference: ", departmentRef);

    // Fetch the document from Firestore
    getDoc(departmentRef)
        .then((docSnapshot) => {
            if (docSnapshot.exists()) {
                console.log(`Data for ${normalizedDepartmentName}:`, docSnapshot.data());
                const departmentData = docSnapshot.data();
                const coursesData = departmentData.courses || [];  // Get the courses array

                if (coursesData.length > 0) {
                    // Since the courses are in pairs (abbreviation, full name), we need to map them
                    let coursesMessage = `Here are the courses offered in the ${normalizedDepartmentName} department:`;
                    
                    // Loop through the courses array (step 2 by 2)
                    for (let i = 0; i < coursesData.length; i += 2) {
                        const courseAbbreviation = coursesData[i];  // Course Abbreviation (even-indexed)
                        const courseName = coursesData[i + 1];  // Course Name (odd-indexed)
                        
                        if (courseAbbreviation && courseName) {
                            coursesMessage += `\n- ${courseAbbreviation}: ${courseName}`;
                        }
                    }

                    // Display the courses message
                    displayMessage(coursesMessage, 'bot');
                } else {
                    displayMessage("Sorry, no courses are listed for the " + normalizedDepartmentName + " department.", 'bot');
                }
            } else {
                displayMessage("Sorry, I couldn't retrieve the " + normalizedDepartmentName + " department's courses.", 'bot');
            }
        })
        .catch((error) => {
            console.error("Error fetching courses:", error);
            displayMessage("There was an error fetching the courses.", 'bot');
        });
}

function fetchUniversityInfo(key, responseMessage) {
    const universityRef = collection(db, "university");
    getDocs(universityRef)
        .then((querySnapshot) => {
            if (!querySnapshot.empty) {
                const data = querySnapshot.docs[0].data();
                const message = data[key] || `Sorry, I couldn't retrieve the ${key}.`;
                displayMessage(message, 'bot');
            } else {
                displayMessage(responseMessage, 'bot');
            }
        })
        .catch((error) => {
            console.error(`Error fetching ${key}:`, error);
            displayMessage("There was an error fetching the information.", 'bot');
        });
}

function displayMessage(message, sender) {
    const chatLog = document.querySelector('.chat-log');
    const newMessage = document.createElement('div');
    newMessage.className = `chat-message ${sender === 'user' ? 'user-message' : 'bot-message'}`;

    // Get current timestamp
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    newMessage.innerHTML = `<p>${message}</p>
                            <span class="message-timestamp">${timestamp}</span>`; 
    chatLog.appendChild(newMessage);
    chatLog.scrollTop = chatLog.scrollHeight;

    updateMessageStyles(newMessage);
}

function updateMessageStyles(messageElement) {
    if (document.body.classList.contains('dark-mode')) {
        messageElement.style.backgroundColor = '#1e1e1e';
        messageElement.style.color = 'white';
    } else {
        messageElement.style.backgroundColor = '#e0e0e0';
        messageElement.style.color = '#333';
    }
}

// Logout functionality
const logoutButton = document.getElementById('logoutButton');
logoutButton.addEventListener('click', function () {
    signOut(auth).then(() => {
        chatContainer.style.display = 'none';
        loginContainer.style.display = 'flex';
        usernameInput.value = '';
        passwordInput.value = '';
        
        // Clear chat history
        const chatLog = document.querySelector('.chat-log');
        chatLog.innerHTML = '';
    }).catch((error) => {
        console.error("Error signing out:", error);
    });
});

// Dark Mode Functionality
const darkModeToggle = document.getElementById('darkModeToggle');
darkModeToggle.addEventListener('click', function () {
    document.body.classList.toggle('dark-mode');
    const app = document.querySelector('.app');
    app.classList.toggle('dark-mode');

    const chatLog = document.querySelector('.chat-log');
    const messages = document.querySelectorAll('.chat-message');

    if (document.body.classList.contains('dark-mode')) {
        chatLog.style.backgroundColor = '#121212';
        messages.forEach(message => {
            message.style.backgroundColor = '#1e1e1e';
            message.style.color = 'white';
        });

        darkModeToggle.style.backgroundColor = '#ff4d4d';
        darkModeToggle.style.color = 'white';

        logoutButton.style.backgroundColor = '#ff4d4d';
        logoutButton.style.color = 'white';

    } else {
        chatLog.style.backgroundColor = 'white';
        messages.forEach(message => {
            message.style.backgroundColor = '#e0e0e0';
            message.style.color = '#333';
        });

        darkModeToggle.style.backgroundColor = '';
        darkModeToggle.style.color = '';

        logoutButton.style.backgroundColor = '#FF0000';
        logoutButton.style.color = 'white';
    }
});
