import React, { useEffect, useState } from 'react'
import './Chat.css';
import ChatHeader from './ChatHeader';
import Message from './Message';
import SoundRecorder from './SoundRecorder';
import firebase from 'firebase';

// Mui Icons
import { IconButton } from '@material-ui/core'
import AddCircleIcon from '@material-ui/icons/AddCircle';
import SendIcon from '@material-ui/icons/Send';
import ReplayIcon from '@material-ui/icons/Replay';
import Button from '@material-ui/core/Button';
import MicNoneIcon from '@material-ui/icons/MicNone';
import MicIcon from '@material-ui/icons/Mic';
// React Flip Move
import FlipMove from 'react-flip-move';
// Emoji Picker
import Picker, { SKIN_TONE_MEDIUM_DARK } from 'emoji-picker-react';
// Redux
import { selectUser } from '../features/userSlice';
import { selectChannelId, seletChannelName } from '../features/appSlice';
import { useSelector } from 'react-redux';
import db from '../firebase/firebase';


function Chat() {
    const user = useSelector(selectUser);
    const channelId = useSelector(selectChannelId);
    const channelCresientials = useSelector(seletChannelName);

    const [input, setInput] = useState('');
    const [messages, setMessage] = useState([]);
    const [start, setStart] = useState('');
    useEffect(() => {
        if (channelId) {
            // Adding to the sender DB
            db.collection('users')
                .doc(user.email)
                .collection('chats').doc(channelId).collection('messages')
                .orderBy("timestamp", "asc")
                .limitToLast(9)
                .onSnapshot((snapshot) => {
                    setStart(snapshot.docs[0])
                    setMessage(snapshot.docs.map((doc) => (
                        {
                            doc: doc,
                            id: doc.id,
                            data: doc.data()
                        }
                    )))
                }
                )

            // Auto scrolling to bottom
            setTimeout(function () { autoScroll() }, 500);
        };
    }, [channelId])

    const loadMore = () => {
        console.log("Loading More...");
        if (start) {
            db.collection('users')
                .doc(user.email)
                .collection('chats').doc(channelId).collection('messages')
                .orderBy("timestamp", "asc")
                .endBefore(start)
                .limitToLast(7)
                .onSnapshot((snapshot) => {
                    (snapshot.docs.reverse().map((doc) => messages.unshift(
                        {
                            id: doc.id,
                            data: doc.data()
                        }

                    )))
                    if (snapshot.docs[0]) {
                        setStart(snapshot.docs[0])
                    } else {
                        setStart(null)
                    }
                }
                )
        } else {
            console.log("No More Data");
        }
        console.log(messages.length)
    }

    const sendMessage = (e) => {
        e.preventDefault();
        // Adding to db for sender
        if (input) {
            db.collection('users').doc(user.email).collection('chats').doc(channelId).collection('messages').add({
                message: input,
                sender: user,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            });
            // Updating last message time
            db.collection('users').doc(user.email).collection('chats').doc(channelId).set({
                last_message: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true })
            // Adding to db for receiver
            db.collection('users').doc(channelId).collection('chats').doc(user.email).collection('messages').add({
                message: input,
                sender: user,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            });
            // Updating last message time for receiver
            db.collection('users').doc(channelId).collection('chats').doc(user.email).set({
                last_message: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true }
            )

            setInput('');
            setTimeout(function () { autoScroll() }, 500);
        }
    }

    // auto Scrolling
    function autoScroll() {
        const elem = document.getElementById("message-box");
        elem.scrollTop = elem.scrollIntoView({ behavior: "smooth" });
    }

    // Emoji handling
    const [isEmojiOpen, setIsEmoijOpen] = useState(false);
    const toggleEmoji = () => {
        setIsEmoijOpen(!isEmojiOpen)
    }
    if (isEmojiOpen) {
        document.onkeydown = function (evt) {
            evt = evt || window.event;
            if (evt.keyCode === 27) {
                toggleEmoji();
            }
        };
    }
    const onEmojiClick = (event, emojiObject) => {
        if (!isVoiceRecorder) {
            setInput(input + emojiObject.emoji)
        }
    }

    // Voice Recorder
    const [isVoiceRecorder, setIsVoiceRecorder] = useState(false)

    return (
        <div className='chat'>
            {channelCresientials &&
                <ChatHeader channelName={channelCresientials.dispalayName} email={channelCresientials.email} />
            }
            <div className="chat__messages">
                {start &&
                    <Button variant="outlined" onClick={loadMore} className="chat__loadMore" color="secondary">
                        <ReplayIcon /> Load More
                    </Button>
                }
                <FlipMove
                    delay={50}
                    easing="cubic-bezier(1, 0, 0, 1)"
                >
                    {messages.map(({ data, id }) => (
                        <div key={id} className="mr-auto">
                            <Message
                                key={id}
                                timestamp={data.timestamp}
                                message={data.message}
                                user={data.sender}
                                {...data}
                            />
                        </div>
                    )
                    )}
                </FlipMove>
                <div id="message-box"></div>
            </div>
            <div className="chat__input">
                <AddCircleIcon />
                {(channelId && !isVoiceRecorder) ?
                    <span className="emoji emoji--happy" onClick={toggleEmoji}></span>
                    :
                    <span className="dummyEmoji">🙂</span>
                }
                <form >
                    <input
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value)
                            setIsVoiceRecorder(false)
                        }}
                        placeholder={`Message #${channelCresientials ? channelCresientials.dispalayName : ' | Select a channel to send message....'}`}
                        disabled={!channelId || isVoiceRecorder}
                    />
                    <button onClick={sendMessage} className="chat__inputButton" type="submit">Hidden Send Message</button>
                </form>
                {(isVoiceRecorder && !input) &&
                    <SoundRecorder setIsVoiceRecorder={setIsVoiceRecorder} className="chat__Recorder" />
                }
                <div className="chat__inputIcons" onClick={sendMessage}>
                    {!isVoiceRecorder &&
                        <Button
                            disabled={!channelId || !input}
                            variant="contained"
                            color="primary"
                            endIcon={<SendIcon>send</SendIcon>}
                        >
                            Send
                    </Button>
                    }
                    {(!input && channelId) &&
                        <IconButton className="chat__MicButton">
                            <MicNoneIcon className={`chat__mic ${isVoiceRecorder && "chat__mic--active"}`} fontSize="large" onClick={() => setIsVoiceRecorder(!isVoiceRecorder)} />
                        </IconButton>
                    }
                </div>
                {isEmojiOpen &&
                    <div className="chat__emojiPicker" id="clickbox">
                        <p>Press Escape to Hide</p>
                        <Picker onEmojiClick={onEmojiClick} disableAutoFocus={true} skinTone={SKIN_TONE_MEDIUM_DARK} groupNames={{ smileys_people: "PEOPLE" }} />
                    </div>
                }
            </div>
        </div>

    )
}

export default Chat;
