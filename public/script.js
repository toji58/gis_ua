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

const isChatPage = document.getElementById("chatPage") !== null;
// Get the settings button and sidebar elements
const menuButton = document.querySelector('.menu-button');
const menuSidebar = document.querySelector('.menu-sidebar');

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
menuButton.addEventListener('click', () => {
    menuSidebar.classList.toggle('open');
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
            errorMessage.style.fontSize = '11px'; // Adjust the font size as needed
        });
}

// Chat functionality
const chatForm = document.getElementById('chat-form');
chatForm.addEventListener('submit', handleChatSubmit);

function handleChatSubmit(event) {
    event.preventDefault();
    const userInput = document.getElementById('input').value.trim();

    console.log("userInput: ", userInput);

    if (userInput.length === 0) {
        return; // Don't send an empty message
    }

    displayMessage(userInput, 'user');
    fetchFirestoreResponse(userInput);
    document.getElementById('input').value = '';
}

// Normalize input: removes punctuation, makes lowercase, and trims spaces
function normalizeInput(input) {
    return input.replace(/[^\w\s]/gi, '').toLowerCase().trim();
}

// Fetch response from Firestore or fallback to predefined responses
async function fetchFirestoreResponse(userInput) {
    const simpleResponses = {
        "how are you": "I'm doing great, thank you for asking! How can I assist you today?",
        "hello": "Hi there! How can I help you?",
        "hi": "Hello! How can I assist you?",
        "what is your name": "I am Santi, the generative AI assistant!",
        "who are you": "I'm an AI designed to assist with your queries about the University of Antique."
    };

    const normalizedInput = normalizeInput(userInput); // Normalize user input

    // First, check for predefined responses
    if (simpleResponses[normalizedInput]) {
        displayMessage(simpleResponses[normalizedInput], 'bot');
    } else {
        const infoMessage = await fetchInfo(normalizedInput);
        displayMessage(infoMessage, 'bot');
    }
}

async function fetchInfo(userInput) {
    const normalizedInput = normalizeInput(userInput);  // Normalize the inpu

    console.log("user Input: ", normalizedInput);

    // Firestore query mappings
    const queryMapping = {
        "what programs were first offered": "firstCoursesOffered",
        "when was the first enrollment": "firstEnrollment",
        "when was the university founded": "foundationDate",
        "when was the university of antique founded": "foundationDate",
        "what is the mission of ua": "mission",
        "what is the mission of university of antique": "mission",
        "what is the mission of the university of antique": "mission",
        "what was the original name of ua": "originalName",
        "what was the original name of university of antique": "originalName",
        "what was the original name of the university of antique": "originalName",
        "what is the vision of ua": "vision",
        "what is the vision of university of antique": "vision",
        "what is the vision of the university of antique": "vision",
        "who is the president of ua": "president",
        "who is the president of university of antique": "president"
    };

    async function handleQuery(query) {
        console.log("Query received in handleQuery:", query);  // Debugging log to track query
        
        const historyRef = doc(db, "universities", "UA");  // Corrected collection name to "universities"
        
        try {
            const docSnapshot = await getDoc(historyRef);
            if (docSnapshot.exists()) {
                const data = docSnapshot.data();
        
                const lowerQuery = query.toLowerCase();
                console.log("Processed Query:", lowerQuery);  // Debugging log for processed query
        
                // Keywords related to history
                const historyKeywords = ["history", "origin", "beginnings", "start", "foundation"];
        
                // Check for history-related queries
                if (historyKeywords.some(keyword => lowerQuery.includes(keyword)) || lowerQuery.includes("history of the university of antique")) {
                    console.log("History query matched.");  // Debugging log for match
                    // Returning historical data
                    return {
                        title: "History of UA",
                        content: `The University of Antique was founded on ${data.foundationDate}. Its original name was "${data.originalName}", and it offers programs like ${data.firstCoursesOffered.join(", ")}.`
                    };
                }
    
                // Keywords related to mission, vision, and other queries
                const missionKeywords = ["mission", "what is the mission", "goal", "purpose", "objective"];
                console.log("Mission Keywords Check:", missionKeywords.some(keyword => lowerQuery.includes(keyword)));  // Debugging log for mission matching
                
                // Check for mission-related queries
                if (missionKeywords.some(keyword => lowerQuery.includes(keyword))) {
                    console.log("Mission query matched.");  // Debugging log for match
                    return {
                        title: "Mission of the University of Antique",
                        content: data.mission || "Mission information not available."
                    };
                }
    
                // Check for vision-related queries
                const visionKeywords = ["vision", "what is the vision", "future", "goal"];
                console.log("Vision Keywords Check:", visionKeywords.some(keyword => lowerQuery.includes(keyword)));  // Debugging log for vision matching
    
                if (visionKeywords.some(keyword => lowerQuery.includes(keyword))) {
                    console.log("Vision query matched.");  // Debugging log for match
                    return {
                        title: "Vision of the University of Antique",
                        content: data.vision || "Vision information not available."
                    };
                }
    
                // Check for original name-related queries
                if (lowerQuery.includes("original name")) {
                    console.log("Original name query matched.");  // Debugging log for match
                    return {
                        title: "Original Name of the University of Antique",
                        content: data.originalName || "Original name information not available."
                    };
                }
    
                // If query does not match known patterns, return a general response
                return { title: "General Information", content: "Sorry, I don't have that information." };
            } else {
                console.log("No data found for UA.");
                return { title: "Data not found", content: "Sorry, no information available." };
            }
        } catch (error) {
            console.error("Error fetching UA data from Firestore:", error);
            return { title: "Error", content: "There was an error fetching the data." };
        }
    }
    
    
// Mapping of services
const serviceAbbreviations = {
    "freshmen": "freshmen_admissions",
    "shiftees": "shiftees_admission",
    "transferees": "transferees_admissions",
    "freshman": "freshmen_admissions", 
    "shiftee": "shiftees_admission", 
    "shifter": "shiftees_admission", 
    "shift": "shiftees_admission",
    "transfer": "transferees_admissions",
    "transferee": "transferees_admissions"
};

// Function to fetch service details from Firestore
async function getServiceDetails(serviceType) {
    const serviceRef = doc(db, "university_services", serviceType);  // Reference to Firestore document

    try {
        const docSnap = await getDoc(serviceRef);  // Fetch the document
        if (docSnap.exists()) {
            const data = docSnap.data();
            const serviceInfo = `
                <strong>Service:</strong> ${data.name} <br>
                <strong>Description:</strong> ${data.description} <br>
                <strong>Note:</strong> ${data.note} <br>
                <strong>Requirements:</strong> <ul>${data.requirements.split(", ").map(req => `<li>${req}</li>`).join('')}</ul>
            `;
            return serviceInfo;  // Return formatted service details
        } else {
            return "I don't have information on that service yet.";  // No data found
        }
    } catch (error) {
        console.error("Error fetching service details:", error);
        return "There was an error fetching the service details.";  // Error handling
    }
}
 // Function to fetch event details (same as before)
async function getEventDetails(eventName) {
    const eventRef = doc(db, "school_events", eventName);  // Reference to Firestore document

    try {
        const docSnap = await getDoc(eventRef);  // Fetch the document
        if (docSnap.exists()) {
            const data = docSnap.data();
            let eventInfo = `<strong>Event Name:</strong> ${data.event_name || "N/A"} <br>`;

            // Dynamically add available fields
            if (data.date) eventInfo += `<strong>Date:</strong> ${data.date} <br>`;
            if (data.description) eventInfo += `<strong>Description:</strong> ${data.description} <br>`;
            if (data.significance) eventInfo += `<strong>Significance:</strong> ${data.significance} <br>`;
            if (data.activities) eventInfo += `<strong>Activities:</strong> ${data.activities} <br>`;
            if (data.hashtags) eventInfo += `<strong>Hashtags:</strong> ${data.hashtags} <br>`;
            if (data.message) eventInfo += `<strong>Message:</strong> ${data.message} <br>`;
            if (data.social_links) eventInfo += `<strong>Social Links:</strong> ${data.social_links} <br>`;

            return eventInfo;  // Return formatted event details
        } else {
            return "I don't have information on that event yet.";  // No data found
        }
    } catch (error) {
        console.error("Error fetching event details:", error);
        return "There was an error fetching the event details.";  // Error handling
    }
}

// Function to fetch enrollment process details
async function getEnrollmentProcess(step) {
    const stepRef = doc(db, "enrollment_process", step);  // Reference to Firestore document

    try {
        const docSnap = await getDoc(stepRef);  // Fetch the document
        if (docSnap.exists()) {
            const data = docSnap.data();
            let enrollmentInfo = `<strong>Step:</strong> ${data.step || "N/A"} <br>`;

            // Dynamically add available fields
            if (data.description) enrollmentInfo += `<strong>Description:</strong> ${data.description} <br>`;
            if (data.details) enrollmentInfo += `<strong>Details:</strong> ${data.details} <br>`;

            return enrollmentInfo;  // Return formatted enrollment process details
        } else {
            return "I don't have information on this step yet.";  // No data found
        }
    } catch (error) {
        console.error("Error fetching enrollment process details:", error);
        return "There was an error fetching the enrollment process details.";  // Error handling
    }
}

// Function to fetch the UA history
async function fetchUAHistory() {
    // Reference to the "UA_History" document in the "university_info" collection
    const historyRef = doc(db, "university_info", "UA_History");

    console.log("thi sis the starting point line 319");
    
    try {
        // Fetch the document snapshot
        const docSnapshot = await getDoc(historyRef); 
        
        // Check if the document exists
        if (docSnapshot.exists()) {
            const data = docSnapshot.data();  // Get the data from Firestore
            return { title: data.title, content: data.content };  // Return title and content
        } else {
            // Return a default message if the document doesn't exist
            return { title: "History not found", content: "No history available." };
        }
    } catch (error) {
        // Log error and return a fallback message in case of an error
        console.error("Error fetching UA history from Firestore:", error);
        return { title: "Error", content: "There was an error fetching the history." };
    }
}

async function getEnrollmentProcedures() {
    try {
        const docRef = doc(db, "procedures", "freshmen"); // Reference to Firestore document
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.steps && Array.isArray(data.steps)) {
                const formattedSteps = data.steps.map(step => {
                    let stepDetails = `<strong>Step ${step.step_number}: ${step.title}</strong><br>`;

                    // Add the step details if they exist
                    if (step.details) {
                        stepDetails += `<strong>Details:</strong> ${step.details}<br>`;
                    }

                    // Add payment methods if they exist
                    if (step.payment_methods) {
                        stepDetails += `<strong>Payment Methods:</strong><ul>`;
                        Object.values(step.payment_methods).forEach(method => {
                            stepDetails += `<li>${method.name} (Method: ${method.method}, Contact: ${method.number})</li>`;
                        });
                        stepDetails += `</ul>`;
                    }

                    // Add fees if they exist
                    if (step.fees) {
                        stepDetails += `<strong>Fees:</strong><ul>`;
                        Object.entries(step.fees).forEach(([key, fee]) => {
                            stepDetails += `<li>${key}: ${fee}</li>`;
                        });
                        stepDetails += `</ul>`;
                    }

                    // Add additional notes if available
                    if (step.additional_notes) {
                        stepDetails += `<strong>Additional Notes:</strong> ${step.additional_notes}<br>`;
                    }

                    return stepDetails; // Return the formatted details for each step
                });

                return formattedSteps.join('<hr>'); // Join the steps with a horizontal line for separation
            } else {
                console.warn("Steps data is missing or not an array.");
                return [];
            }
        } else {
            console.warn("No such document found in Firestore.");
            return [];
        }
    } catch (error) {
        console.error("Error fetching enrollment procedures:", error);
        return [];
    }
}



// Example usage: Fetch UA history and log the result
fetchUAHistory().then(response => {
    console.log("Title: ", response.title);  // This will log the title property
    console.log("Content: ", response.content);  // This will log the content property

});
    const universityRef = doc(db, "universities", "UA");

// Check if the query is related to services (freshmen, shiftees, etc.)
if (normalizedInput.includes("freshmen") || normalizedInput.includes("shiftees") || normalizedInput.includes("transferees")) {
    const serviceAbbr = Object.keys(serviceAbbreviations).find(abbr => normalizedInput.includes(abbr));
    if (serviceAbbr) {
        const serviceType = serviceAbbreviations[serviceAbbr]; // Get the Firestore document name for the service
        return await getServiceDetails(serviceType); // Fetch service details from Firestore
    }
}

if (normalizedInput.includes("location")) {
    // const serviceAbbr = Object.keys(serviceAbbreviations).find(abbr => normalizedInput.includes(abbr));
    // if (serviceAbbr) {
    //     const serviceType = serviceAbbreviations[serviceAbbr]; // Get the Firestore document name for the service
    //     return await getServiceDetails(serviceType); // Fetch service details from Firestore
    // }
    console.log("fteching location");
}

if (normalizedInput.includes("colleges") && normalizedInput.includes("university")) {
    try {
        const collegeNames = await getCollegesNames();  // Await the async function to get college names

        // Check if there are any college names and format the response
        if (collegeNames.length > 0) {
            return `The colleges offered by the University of Antique are: ${collegeNames.join(", ")}.`;
        } else {
            return "Sorry, no colleges found.";
        }
    } catch (error) {
        console.error("Error fetching college names:", error);
        return "Sorry, I couldn't fetch the college names at the moment.";  // Graceful error handling
    }
}

if (normalizedInput.includes("history") || 
    normalizedInput.includes("beginnings") ||  
    normalizedInput.includes("establishment")) {

    console.log("this is the starting point line 435");
    
    const uaHistory = await fetchUAHistory(); // Fetch UA History details
    
    // Return a formatted string with both the title and content of history
    return `${uaHistory.title}\n\n${uaHistory.content}`;
}

// [NEW CODE]: Handling Enrollment Steps based on the query
if (["registration", "register", "enroll", "enrol"].some(keyword => normalizedInput.includes(keyword))) {
    return await getEnrollmentProcedures("step_1_registration"); // Add this line to fetch the registration step
} else if (normalizedInput.includes("appraisal")) {
    return await getEnrollmentProcedures("step_2_appraisal_and_advising"); // Add this line for appraisal step
} else if (normalizedInput.includes("assessment")) {
    return await getEnrollmentProcedures("step_3_assessment_and_fees"); // Add this line for assessment step
} else if (normalizedInput.includes("confirmation")) {
    return await getEnrollmentProcedures("step_4_confirmation_of_enrollment"); // Add this line for confirmation step
} else if (normalizedInput.includes("lms")) {
    return await getEnrollmentProcedures("step_5_access_to_lms"); // Add this line for LMS step
}


if (normalizedInput.includes("registration")) {
    return await getEnrollmentProcess("step_1_registration");
} else if (normalizedInput.includes("appraisal")) {
    return await getEnrollmentProcess("step_2_appraisal_and_advising");
} else if (normalizedInput.includes("assessment")) {
    return await getEnrollmentProcess("step_3_assessment_and_fees");
} else if (normalizedInput.includes("confirmation")) {
    return await getEnrollmentProcess("step_4_confirmation_of_enrollment");
} else if (normalizedInput.includes("lms")) {
    return await getEnrollmentProcess("step_5_access_to_lms");
}


// Check if the query is related to events (e.g., Hugyaw, Paskua, UA Foundation Day)
if (normalizedInput.includes("hugyaw") || normalizedInput.includes("paskua") || normalizedInput.includes("university of antique foundation day")) {
    const eventNames = ["hugyaw", "paskua", "university of antique foundation day"]; // Use the full event name
    const eventName = eventNames.find(event => normalizedInput.includes(event));
    if (eventName) {
        return await getEventDetails(eventName); // Fetch event details from Firestore
    }
}


// Check if the query matches any specific UA-related questions
for (let query in queryMapping) {if (normalizedInput.includes("courses") || normalizedInput.includes("programs")) {
    let collegeAbbr = Object.keys(collegeAbbreviations).find(abbr => 
        normalizedInput.includes(abbr) || normalizedInput.includes(collegeAbbreviations[abbr])
    );

    if (collegeAbbr) {
        return await getCollegePrograms(collegeAbbr, collegeAbbreviations);

    }
}

    if (normalizedInput.includes(query.toLowerCase())) {
        try {
            const docSnapshot = await getDoc(universityRef);
            if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                return data[queryMapping[query]] || "Sorry, no information available.";
            } else {
                return "No data found for this query.";
            }
        } catch (error) {
            console.error("Error fetching data from Firestore:", error);
            return "There was an error fetching the information.";
        }
    }
}

<<<<<<< Updated upstream
async function handleQuery(query) {
    console.log("Query to get location received");
=======
async function fetchInfo(query) {
    // Ensure the query is normalized to lowercase
>>>>>>> Stashed changes
    const normalizedQuery = query.toLowerCase();
    console.log("Normalized Query:", normalizedQuery);  // Log the query for debugging

    // Add the office matching logic here
    let officeId = '';

    // Adding more flexible matching for the query
    if (normalizedQuery.includes("vice president for academic affairs") || 
        normalizedQuery.includes("vppa") || 
        normalizedQuery.includes("academic affairs office") || 
        normalizedQuery.includes("office of vppa")) {
        officeId = "office_of_the_vice_president_for_academic_affairs";
    }

    if (normalizedQuery.includes("ccs location") || normalizedQuery.includes("vppa")) {
        officeId = "office_of_the_vice_president_for_academic_affairs";
    }
    // Add more conditional checks for other offices if necessary
    else {
        console.log("I don't have an answer for that yet.");
        return;
    }

    // Fetch office details from Firestore and handle result
    const officeData = await getOfficeLocation(officeId);
    if (officeData) {
        console.log("Office Name: ", officeData.name);
        console.log("Details: ", officeData.detailed_response);
    } else {
        console.log("No data available for the office.");
    }
}


// If no matching query is found, handle history-specific query
if (normalizedInput.includes("history of university of antique")) {
    return await handleQuery(userInput);  // Fetch history from Firestore
}

if (normalizedInput.includes("location")){
    return await getSpecificBuildingLocation(userInput);
}
    
return "I don’t have an answer for that yet.";
}


// Mapping for abbreviations & full names
const collegeMapping = {
    "ccs": "college_of_computer_studies",
    "cea": "college_of_engineering_and_architecture",
    "ccje": "college_of_criminal_justice_and_education",
    "cms": "college_of_maritime_studies",
    "cba": "college_of_business_and_accountancy",
    "cas": "college_of_arts_and_sciences",
    "cit": "college_of_industrial_technology",
    "cte": "college_of_teacher_education",
    "college of computer studies": "college_of_computer_studies",
    "college of engineering and architecture": "college_of_engineering_and_architecture",
    "college of criminal justice and education": "college_of_criminal_justice_and_education",
    "college of maritime studies": "college_of_maritime_studies",
    "college of business and accountancy": "college_of_business_and_accountancy",
    "college of arts and sciences": "college_of_arts_and_sciences",
    "college of industrial technology": "college_of_industrial_technology",
    "college of teacher education": "college_of_teacher_education"
};

// Mapping of abbreviations to full college names
const collegeAbbreviations = {
    "ccs": "College of Computer Studies",
    "cea": "College of Engineering and Architecture",
    "ccje": "College of Criminal Justice Education",
    "cms": "College of Maritime Studies",
    "cba": "College of Business Administration",
    "cas": "College of Arts and Sciences",
    "cit": "College of Industrial Technology",
    "cte": "College of Teacher Education",
    "college of computer studies": "ccs", 
    "college of engineering and architecture": "cea", 
    "college of criminal justice education": "ccje", 
    "College of Maritime Studies": "cms", 
    "college of business administration": "cba",
    "college of arts and sciences": "cas", 
    "college of industrial technology": "cit", 
    "college of teacher education": "cte",
};

async function getCollegePrograms(collegeAbbr, collegeAbbreviations) {
    // Normalize the input to lowercase to handle both abbreviation and full name case-insensitively
    const normalizedInput = collegeAbbr.trim().toLowerCase();

    // First, check if the input is an abbreviation (direct match)
    let abbreviation = collegeAbbreviations[normalizedInput] ? normalizedInput : null;

    // If it's not an abbreviation, check for a match with full name (full name -> abbreviation)
    if (!abbreviation) {
        abbreviation = Object.keys(collegeAbbreviations).find(
            (abbr) => collegeAbbreviations[abbr].toLowerCase() === normalizedInput
        );
    }

    // If abbreviation is found, map it to full name, otherwise keep the input as full name
    const fullCollegeName = abbreviation ? collegeAbbreviations[abbreviation] : normalizedInput;

    // Construct the Firestore reference using the abbreviation (uppercase) or full name (uppercase)
    const collegeRef = doc(db, "colleges", abbreviation ? abbreviation.toUpperCase() : normalizedInput.toUpperCase());

    console.log("Fetching programs for document:", abbreviation ? abbreviation.toUpperCase() : normalizedInput.toUpperCase());  // Debugging document reference

    try {
        // Fetch the 'programs' subcollection within the college document
        const programsSnapshot = await getDocs(collection(collegeRef, "programs"));

        // Log the snapshot to check if we get any results
        console.log("Programs snapshot:", programsSnapshot);

        // If programs are found, return them
        if (!programsSnapshot.empty) {
            let programs = [];
            programsSnapshot.forEach((doc) => {
                const programData = doc.data();
                // Match both abbreviation and full name in 'college' and 'collegeFullname' fields
                if (
                    programData.college.toLowerCase() === abbreviation || 
                    programData.collegeFullname.toLowerCase() === fullCollegeName.toLowerCase()
                ) {
                    const programName = programData.name;  // Assuming 'name' contains the program name
                    programs.push(programName);  // Add program name to the list
                }
            });
            if (programs.length > 0) {
                return `Programs offered by ${fullCollegeName}: ${programs.join(", ")}`;
            } else {
                return `No programs found for ${fullCollegeName}.`;
            }
        } else {
            return `No programs found for ${fullCollegeName}.`;
        }
    } catch (error) {
        console.error("Error fetching programs:", error);
        return `Error fetching the programs for ${fullCollegeName}.`;
    }
}

async function getCollegesNames() {
    try {
        const querySnapshot = await getDocs(collection(db, "colleges"));
        const collegeNames = [];
        
        querySnapshot.forEach(doc => {
            const collegeData = doc.data();
            const collegeName = collegeData.name;  // Assuming the field holding the full name is 'name'
            if (collegeName) {
                collegeNames.push(collegeName); // Add full college name to the array
            }
        });
        
        return collegeNames;
    } catch (error) {
        console.error("Error fetching college names:", error);
        throw new Error("Unable to fetch college names.");
    }
}

async function getSpecificBuildingLocation(collegeName) {
    try {
        // Ensure Firestore key format (convert spaces to underscores & lowercase)
        // const normalizedCollegeName = collegeName.toLowerCase().replace(/\s+/g, "_");
        const normalizedCollegeName = "college_of_computer_studies";

        // Query Firestore for the college document
        const docRef = doc(db, "building_locations", normalizedCollegeName);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            // Return only the detailed response
            return data.detailed_response || "Sorry, no detailed location information found.";
        } else {
            return "Sorry, no location data found for that college.";
        }
    } catch (error) {
        console.error("Error retrieving location:", error);
        return "Sorry, I couldn't retrieve the location for that college.";
    }
}

async function getOfficeLocation(officeId) {
    const docRef = doc(db, "office_locations", officeId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
        return docSnap.data();  // Return the office data
    } else {
        return null;  // If the document doesn't exist
    }
}

// Display the message on the chat interface
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
