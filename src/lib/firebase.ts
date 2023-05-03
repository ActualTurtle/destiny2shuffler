import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: "AIzaSyC-Nxdzv9KzDzI5mSGaxYctQ-hRg2p-Y8E",
  authDomain: "destiny2-shuffler.firebaseapp.com",
  projectId: "destiny2-shuffler",
  storageBucket: "destiny2-shuffler.appspot.com",
  messagingSenderId: "345218062326",
  appId: "1:345218062326:web:af4e98305104cf73dfd9d7",
  measurementId: "G-ZE7HMGNGFV"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
