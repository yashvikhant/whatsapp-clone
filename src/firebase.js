import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
    apiKey: "AIzaSyD4eZ-Uck7ZLbqtXGUoVgci3FliCLDLBwg",
    authDomain: "whatsapp-clone-2-b1921.firebaseapp.com",
    projectId: "whatsapp-clone-2-b1921",
    storageBucket: "whatsapp-clone-2-b1921.appspot.com",
    messagingSenderId: "241824790684",
    appId: "1:241824790684:web:d3b0bc477f0ece70a8d559",
    measurementId: "G-XRDQGS7EJ5"
  };

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();

export { auth, provider };
export default db;