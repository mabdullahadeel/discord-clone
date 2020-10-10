import firebase from 'firebase';

const firebaseConfig = {
    apiKey: "AIzaSyA1zK_hXNQNlN11HHM0trHqGtLIH9WCiwg",
    authDomain: "discord-clone-abd.firebaseapp.com",
    databaseURL: "https://discord-clone-abd.firebaseio.com",
    projectId: "discord-clone-abd",
    storageBucket: "discord-clone-abd.appspot.com",
    messagingSenderId: "855533023040",
    appId: "1:855533023040:web:cffbc63c420155d43e54a5",
    measurementId: "G-7622MH3H6M"
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth()
const provider = new firebase.auth.GoogleAuthProvider();

export { auth, provider };
export default db