// // Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC-Nxdzv9KzDzI5mSGaxYctQ-hRg2p-Y8E",
  authDomain: "destiny2-shuffler.firebaseapp.com",
  projectId: "destiny2-shuffler",
  storageBucket: "destiny2-shuffler.appspot.com",
  messagingSenderId: "345218062326",
  appId: "1:345218062326:web:af4e98305104cf73dfd9d7",
  measurementId: "G-ZE7HMGNGFV"
};

// // Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

//console.log them to avoid complaints about unused variables.
console.log(app); 
console.log(db);

/**
 * I Had to comment this all out for the preliminary build
 * 
 */