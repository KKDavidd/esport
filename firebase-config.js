import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC43SHlSQLAW1HnUM1h2ofwf_dItk_N_kE",
  authDomain: "ipariesport.firebaseapp.com",
  projectId: "ipariesport",
  storageBucket: "ipariesport.firebasestorage.app",
  messagingSenderId: "118648106017",
  appId: "1:118648106017:web:2e0eb331140fc47bf24760"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);