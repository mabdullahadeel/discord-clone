import React, { useState, useEffect } from 'react'
import './Sidebar.css';
//Components
import SidebarChannel from './SidebarChannel'
// Mui Icons
import { Avatar, IconButton } from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import AddIcon from '@material-ui/icons/Add';
import SignalCellularAltIcon from '@material-ui/icons/SignalCellularAlt';
import InfoIcon from '@material-ui/icons/Info';
import PhoneIcon from '@material-ui/icons/Phone';
import MicIcon from '@material-ui/icons/Mic';
import HeadsetIcon from '@material-ui/icons/Headset';
import SettingsIcon from '@material-ui/icons/Settings';
//Redux
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice';
// firebase
import { auth } from '../firebase/firebase';
import db from '../firebase/firebase';
import firebase from 'firebase';

function Sidebar() {
    const user = useSelector(selectUser);
    const [channels, setChannels] = useState([]);

    useEffect(() => {
        // db.collection('channels').onSnapshot((snapshot) =>
        //     setChannels(
        //         snapshot.docs.map((doc) => ({
        //             id: doc.id,
        //             channel: doc.data(),
        //         }))
        //     )
        // );

        db.collection('users')
            .doc(user.email)
            .collection('chats')
            .onSnapshot((snapshot) =>
                setChannels(snapshot.docs.map((doc) => ({
                    id: doc.id,
                    channel: doc.data(),
                })))
            )
    }, [])
    console.log(channels)

    // Adding the Channel
    const handleAddConversation = () => {
        const receiverEmail = prompt("Enter an email");
        if (receiverEmail) {
            db.collection('users').where('email', '==', receiverEmail).get()
                .then(function (querySnapshot) {
                    querySnapshot.forEach(function (prof) {
                        // Adding Chat to Receiver db
                        db.collection('users').doc(prof.data().email).collection('chats').doc(user.email).set({
                            chatInitiator: user
                        })
                        db.collection('users').doc(prof.data().email).collection('chats').doc(user.email).collection('messages').add({
                            message: "Hello I am using Discord! Lets have Chat!",
                            sender: user,
                            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                        })
                        // Adding Chat to Senders db
                        db.collection('users').doc(user.email).collection('chats').doc(prof.data().email).set({
                            chatInitiator: user
                        })
                        db.collection('users').doc(user.email).collection('chats').doc(prof.data().email).collection('messages').add({
                            message: "Hello I am using Discord! Lets have Chat!",
                            sender: user,
                            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                        })
                    });
                })
                .catch(function (error) {
                    console.log("Error getting documents: ", error);
                });
        }
    };

    return (
        <div className="sidebar">
            <div className="sidebar__top">
                <h3>Conversation 1</h3>
                <IconButton>
                    <ExpandMoreIcon />
                </IconButton>
            </div>
            <div className="sidebar__channels">
                <div className="sidebar__channelsHeader">
                    <div className="sidebar__header">
                        <ExpandMoreIcon />
                        <h1>Text Channels</h1>
                    </div>

                    <AddIcon className="sidebar__addChannel" onClick={handleAddConversation} />
                </div>
                <div className="sidebar__channelsList">
                    {channels.map(({ id, channel }) => (
                        <SidebarChannel key={id} channelName={id} id={id}
                        />
                    ))}
                </div>
            </div>

            <div className="sidebar__voice">
                <SignalCellularAltIcon className="sidebar__voiceIcon"
                    fontSize="large"
                />
                <div className="sidebar__voiceInfo">
                    <h3>Voice Connected</h3>
                    <p>Stream</p>
                </div>
                <div className="sidebar__voiceInfoIcons">
                    <InfoIcon />
                    <PhoneIcon />
                </div>
            </div>

            <div className="sidebar__profile">
                <Avatar onClick={() => auth.signOut()} src={user.photo} />
                <div className="sidebar__profileInfo">
                    <h3>{user.dispalayName}</h3>
                    <p>#{user.uid.substring(0, 5)}</p>
                </div>
                <div className="sidebar__profileIcons">
                    <MicIcon />
                    <HeadsetIcon />
                    <SettingsIcon />
                </div>
            </div>
        </div>
    )
}

export default Sidebar
