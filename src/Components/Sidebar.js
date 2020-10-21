import React, { useState, useEffect } from 'react'
import './Sidebar.css';
//Components
import ChannelList from './ChannelList';
// ReactStrap
import {
    Button, Modal, ModalHeader, ModalBody,
    FormGroup,
} from 'reactstrap';
import { AvForm, AvField } from 'availity-reactstrap-validation';
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
import { userPresenceRealtimeDB_Firestore } from '../firebase/userPresence';

function Sidebar() {
    const user = useSelector(selectUser);
    const [conversation, setConversation] = useState([]);

    useEffect(() => {
        userPresenceRealtimeDB_Firestore(user);
        db.collection('users')
            .doc(user.email)
            .collection('chats')
            .orderBy('last_message', 'desc')
            .onSnapshot((snapshot) =>
                setConversation(snapshot.docs.map((doc) => ({
                    id: doc.id,
                    channel: doc.data(),
                })))
            )
    }, [])

    // Adding the Channel
    const [email, setEmail] = useState('');
    const handleAddConversation = () => {
        toggle();
        const receiverEmail = email;
        if (receiverEmail) {
            db.collection('users').where('email', '==', receiverEmail).get()
                .then(function (querySnapshot) {
                    if (querySnapshot.empty) {
                        alert("No such user exist")
                    }
                    else {
                        querySnapshot.forEach(function (prof) {
                            // Adding Chat to Receiver db
                            db.collection('users').doc(prof.data().email).collection('chats').doc(user.email).set({
                                last_message: firebase.firestore.FieldValue.serverTimestamp(),
                                otherPerson: user
                            })
                            db.collection('users').doc(prof.data().email).collection('chats').doc(user.email).collection('messages').add({
                                message: "Hello I am using Discord! Lets have Chat!",
                                sender: user,
                                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                            })
                            // Adding Chat to Senders db
                            db.collection('users').doc(user.email).collection('chats').doc(prof.data().email).set({
                                last_message: firebase.firestore.FieldValue.serverTimestamp(),
                                otherPerson: prof.data()
                            })
                            db.collection('users').doc(user.email).collection('chats').doc(prof.data().email).collection('messages').add({
                                message: "Hello I am using Discord! Lets have Chat!",
                                sender: user,
                                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                            })
                        });
                    }
                })
                .catch(function (error) {
                    alert(error);
                });
        }
    };

    // Modal Implementation
    const [isModalOpen, setIsModalOpen] = useState(false);
    const toggle = () => setIsModalOpen(!isModalOpen);
    const handleValidSubmit = (event, values) => {
        setEmail(values.email)
        handleAddConversation();
    }

    return (
        <React.Fragment>
            <div>
                <Modal isOpen={isModalOpen} toggle={toggle}>
                    <ModalHeader toggle={toggle}>Receiver's Email</ModalHeader>
                    <ModalBody>
                        <AvForm onValidSubmit={handleValidSubmit}>
                            <FormGroup>
                                <AvField name="email" label="Email Address" type="email" required placeholder="example@example.com" />
                            </FormGroup>
                            <Button type='submit' className="sidebar__modalButton" value='submit'>Let's Chat</Button>
                        </AvForm>
                    </ModalBody>
                </Modal>
            </div>
            <div className="sidebar">
                <div className="sidebar__top">
                    <h3>Personal</h3>
                    <IconButton>
                        <ExpandMoreIcon />
                    </IconButton>
                </div>
                <div className="sidebar__channels">
                    <div className="sidebar__channelsHeader">
                        <div className="sidebar__header">
                            <h1>Chats</h1>
                        </div>
                        <IconButton onClick={toggle}>
                            <AddIcon className="sidebar__addChannel"
                            />
                        </IconButton>
                    </div>
                    <div className="sidebar__channelsList">
                        <ChannelList conversation={conversation} />
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
        </React.Fragment>
    )
}

export default Sidebar
