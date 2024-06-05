import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCqcyzgmTXWovJz-SFst8VkapqvRKlh7jM",
  authDomain: "reactgram-86a75.firebaseapp.com",
  databaseURL: "https://reactgram-86a75-default-rtdb.firebaseio.com/",
  projectId: "reactgram-86a75",
  storageBucket: "reactgram-86a75.appspot.com",
  messagingSenderId: "1071278513984",
  appId: "1:1071278513984:web:7e4767be9bbced9601a4a5"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const realtimeDb = getDatabase(app);

export { app, db, auth, realtimeDb };