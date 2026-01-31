import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBSg-L3FwF_Va5ZC8KsxnKkXHbdCLXgOQM",
    authDomain: "lista-presentes-casament-ff8bb.firebaseapp.com",
    projectId: "lista-presentes-casament-ff8bb",
    appId: "1:1006051853938:web:1e412d99d7719e4f9f64eb"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);