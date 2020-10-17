// ref : https://firebase.google.com/docs/firestore/solutions/presence?fbclid=IwAR0BHug9CzSHwa9z7QStq9OqaIqF6Ru6MW6Ev6Q4HyDs_9Xe_P-4YKvY_U8

/* This file contains the code for using user presence in the application using firbase realtie db and firebase cloud functions */

import firebase from 'firebase';
import db from './firebase';

export function userPresenceRealtimeDB_Firestore(user) {
    // Creating reference to this user in realtime db
    const uid = user.email;
    let userStatusDatabaseRef = firebase.database().ref('/users_status/' + user.uid);

    // constants for setting the values for this user in realtime db
    const isOfflineForDatabase = {
        email: uid,
        status: "offline",
        last_changed: firebase.database.ServerValue.TIMESTAMP,
    };

    const isOnlineForDatabase = {
        email: uid,
        status: 'online',
        last_changed: firebase.database.ServerValue.TIMESTAMP,
    };

    // Using firebase special path to access the presence change
    firebase.database().ref('.info/connected').on('value', function (snapshot) {
        // if not currently connected -- Don't do anything
        if (snapshot.val() == false) {
            return;
        }
    });

    // if user is connected, set a callback function for when user disconnects and mark the user as online
    userStatusDatabaseRef.onDisconnect().set(isOfflineForDatabase).then(function () {
        // Once the server has acknowledged the callback funtion to mark the user as offline on disconnect
        // we can saflety mark the user online knowing that the server will mark it offline if something goes wrong
        userStatusDatabaseRef.set(isOnlineForDatabase);
    })



    //  After the things have created and updated in the firestore, we can mirror those chages in the firestore
    const userStatusFirestoreRef = db.collection('users').doc(uid);

    const isOfflineForFirestore = {
        status: "offline",
        last_changed: firebase.firestore.FieldValue.serverTimestamp(),
    };

    const isOnlineForFirestore = {
        status: 'online',
        last_changed: firebase.firestore.FieldValue.serverTimestamp(),
    };

    firebase.database().ref('.info/connected').on('value', function (snapshot) {
        if (snapshot.val() == false) {
            // this means that the user is disconencted so we mark current user offline safely in the firestore
            userStatusFirestoreRef.set(isOfflineForFirestore, { merge: true });
            return;
        };

        userStatusDatabaseRef.onDisconnect().set(isOfflineForDatabase).then(function () {
            userStatusDatabaseRef.set(isOnlineForDatabase);
            userStatusFirestoreRef.set(isOnlineForFirestore, { merge: true });
        })
    })
};



