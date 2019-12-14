import firebase from '@firebase/app';
import '@firebase/auth';
import '@firebase/database';
import '@firebase/storage';

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyB6RFLh6xYwQLqKmfopNo7qDhrkawl_NLQ",
  authDomain: "chatapp-ec88b.firebaseapp.com",
  databaseURL: "https://chatapp-ec88b.firebaseio.com",
  projectId: "chatapp-ec88b",
  storageBucket: "chatapp-ec88b.appspot.com",
  messagingSenderId: "949663345060",
  appId: "1:949663345060:web:ea2d208aa0541e1a973931",
  measurementId: "G-G1CX42VXFY"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase;
