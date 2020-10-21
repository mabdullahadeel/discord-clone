const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initializing the app without any Configs as the function is in the cloud and it will detect the config from the environment
admin.initializeApp()

const firestore = admin.firestore();

// Creating a new function that is triggered when the status of some object changes inside the realtime database
// This function will sense the change and chage the status in the firestore accordingly

exports.onUserStatusChanged = functions.database.ref('/users_status/{uid}').onUpdate(
    async (change, context) => {
        // Getting the data that is just written to the realtime database
        const eventStatus = change.after.val();
        const userEmail = eventStatus.email;

        // Creating the reference of the current entry inside the Firestore
        const userStatusFirestoreRef = firestore.doc(`users/${userEmail}`);

        // It is likely that the Realtime Database change that triggered
        // this event has already been overwritten by a fast change in
        // online / offline status, so we'll re-read the current data
        // and compare the timestamps.
        const statusSnapshot = await change.after.ref.once('value');
        const status = statusSnapshot.val();
        console.log(status, eventStatus);

        // If the current timestamp for this data is newer than
        // the data that triggered this event, we exit this function.
        if (status.last_changed > eventStatus.last_changed) {
            return null;
        }
        // Otherwise, we convert the last_changed field to a Date
        eventStatus.last_changed = new Date(eventStatus.last_changed);

        return userStatusFirestoreRef.set(eventStatus, { merge: true })
    }
)