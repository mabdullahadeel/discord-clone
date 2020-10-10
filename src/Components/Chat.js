import React, { useEffect, useState } from 'react'
import './Chat.css';
import ChatHeader from './ChatHeader';
import Message from './Message';
import firebase from 'firebase';

// Mui Icons
import AddCircleIcon from '@material-ui/icons/AddCircle';
import CardGiftcardIcon from '@material-ui/icons/CardGiftcard';
import GifIcon from '@material-ui/icons/Gif';
import EmojiEmotionsIcon from '@material-ui/icons/EmojiEmotions';

// Redux
import { selectUser } from '../features/userSlice';
import { selectChannelId, seletChannelName } from '../features/appSlice';
import { useSelector } from 'react-redux';
import db from '../firebase/firebase';

function Chat() {
    const user = useSelector(selectUser);
    const channelId = useSelector(selectChannelId);
    const channelName = useSelector(seletChannelName);

    const [input, setInput] = useState('');
    const [messages, setMessage] = useState([]);

    useEffect(() => {
        if (channelId) {
            // Adding to the sender DB
            db.collection('users')
                .doc(user.email)
                .collection('chats').doc(channelId).collection('messages')
                .orderBy("timestamp", "asc")
                .onSnapshot((snapshot) =>
                    setMessage(snapshot.docs.map((doc) => doc.data()))
                )
            // Auto scrolling to bottom
            setTimeout(function () { autoScroll() }, 500);
        };
    }, [channelId])


    const sendMessage = (e) => {
        e.preventDefault();
        // Adding to db for sender
        db.collection('users').doc(user.email).collection('chats').doc(channelId).collection('messages').add({
            message: input,
            sender: user,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        });
        // Adding to db for receiver
        db.collection('users').doc(channelId).collection('chats').doc(user.email).collection('messages').add({
            message: input,
            sender: user,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        });

        setInput('');
        setTimeout(function () { autoScroll() }, 500);
    }

    // auto Scrolling
    function autoScroll() {
        const elem = document.getElementById("message-box");
        elem.scrollTop = elem.scrollIntoView({ behavior: "smooth" });
    }

    return (
        <div className='chat'>
            <ChatHeader channelName={channelName} />
            <div className="chat__messages">
                {messages.map((message) => (
                    <>
                        <Message
                            timestamp={message.timestamp}
                            message={message.message}
                            user={message.sender}
                        />
                    </>
                )
                )}
                <div id="message-box"></div>
            </div>
            <div className="chat__input">
                <AddCircleIcon />
                <form >
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={`Message #${channelName ? channelName : ' | Select a channel to send message....'}`}
                        disabled={!channelId}
                    />
                    <button onClick={sendMessage} className="chat__inputButton" type="submit">Hidden Send Message</button>
                </form>
                <div className="chat__inputIcons">
                    <CardGiftcardIcon fontSize="large" />
                    <GifIcon fontSize="large" />
                    <EmojiEmotionsIcon fontSize="large" />
                </div>
            </div>
        </div>

    )
}

export default Chat
