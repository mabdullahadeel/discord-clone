import React, { useState } from 'react';
import './SoundRecorder.css';
import { ReactMic } from 'react-mic';
import { Progress } from 'reactstrap';
import { Grow } from '@material-ui/core';
// MUI
import { IconButton } from '@material-ui/core'
import Button from '@material-ui/core/Button';
import DeleteIcon from '@material-ui/icons/Delete';
import SendIcon from '@material-ui/icons/Send';
import KeyboardVoiceIcon from '@material-ui/icons/KeyboardVoice';
import StopIcon from '@material-ui/icons/Stop';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import CloseIcon from '@material-ui/icons/Close';
// firebase
import db from '../firebase/firebase';
import firebase from 'firebase';
// Redux
import { selectUser } from '../features/userSlice';
import { selectChannelId, seletChannelName } from '../features/appSlice';
import { useSelector } from 'react-redux';

function SoundRecorder({ setIsVoiceRecorder, isVoiceRecorder }) {
    const [recording, setRecording] = useState(false);
    const [actionButtons, setActionButtons] = useState(true);
    const [progressBarPercentage, setProgressBarPercentage] = useState('');
    const [message, setMessage] = useState('');
    const [data, setData] = useState({});

    // Redux
    const user = useSelector(selectUser);
    const channelId = useSelector(selectChannelId);

    const startRecording = () => {
        setRecording(true)
        setTimeout(function () {
            stopRecording()
            setMessage("You can only send 10 secs voice.")
        }, 10000)
    }

    const stopRecording = () => {
        setRecording(false)
        setActionButtons(false)
    }

    // const onData = (recordedBlob) => {
    //     console.log('chunk of real-time data is: ', recordedBlob);
    // }

    const onStop = (recordedBlob) => {
        setData(recordedBlob)
        // Custom Functions
    }
    const playRecording = () => {
        const audio = new Audio(data.blobURL);
        audio.play();
    }
    const deleteRecording = () => {
        setData({});
        setActionButtons(true);
        message && setMessage('');
    }

    const sendAudio = async () => {
        // Some Cool Firebase Magic Goes Here
        // Firebase Storage
        const storageRef = firebase.storage().ref('VoiceMessages/' + data.blobURL.split("/")[3]);
        const task = storageRef.put(data.blob);


        await task.on('state_changed',
            // Progress of the Current Upload 
            function progress(snapshot) {
                let percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setProgressBarPercentage(percentage);
            },
            // Handling The Error
            function error(err) {
                alert("Ooppps! Could not send the voice right now 😢. But you can always retry.")
            },
            // Handling successful complete addition to firebase storage
            await async function complete() {
                await task.snapshot.ref.getDownloadURL().then(function (downloadURl) {
                    // Updating the states
                    setActionButtons(true)
                    setIsVoiceRecorder(false)
                    message && setMessage('')
                    setData({})
                    // Creating message in the firestore
                    db.collection('users').doc(user.email).collection('chats').doc(channelId).collection('messages').add({
                        message: {
                            MessageType: "VoiceMessage",
                            getURL_REF: downloadURl
                        },
                        sender: user,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    });
                    // Updating last message time
                    db.collection('users').doc(user.email).collection('chats').doc(channelId).set({
                        last_message: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true })
                    // Adding to db for receiver
                    db.collection('users').doc(channelId).collection('chats').doc(user.email).collection('messages').add({
                        message: {
                            MessageType: "VoiceMessage",
                            getURL_REF: downloadURl
                        },
                        sender: user,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    });
                    // Updating last message time for receiver
                    db.collection('users').doc(channelId).collection('chats').doc(user.email).set({
                        last_message: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true }
                    )
                }
                )
            })
    }


    return (
        <Grow in={isVoiceRecorder} >
            <div className="soundRecorder">
                <div className="soundRecorder__container">
                    <ReactMic
                        record={recording}
                        mimeType="audio/webm"
                        className="sound-wave"
                        onStop={onStop}
                        // onData={onData}
                        strokeColor="red"
                        backgroundColor="#2f3135" />
                    {/* Progress Bar */}
                    <div className="progressBar">
                        {message && <p>{message}</p>}
                        <div className="progressbar__container">
                            {progressBarPercentage &&
                                <Progress color="info" value={progressBarPercentage} />
                            }
                        </div>
                    </div>
                    <div className="soundRecorder__buttons">
                        {!recording ?
                            <Button
                                variant="contained"
                                disabled={!actionButtons}
                                className={`MUIbuttons recocrdButton ${!actionButtons && "disableRecord"}`}
                                startIcon={<KeyboardVoiceIcon />}
                                onClick={startRecording}
                            >
                                Record
                    </Button>
                            :
                            <Button
                                variant="contained"
                                disabled={false}
                                className="MUIbuttons stopButton"
                                startIcon={<StopIcon />}
                                onClick={stopRecording}
                            >
                                Stop
                    </Button>
                        }
                        <Button
                            className="MUIbuttons playButton"
                            disabled={actionButtons}
                            variant="contained"
                            color="primary"
                            startIcon={<PlayArrowIcon />}
                            onClick={playRecording}
                        >
                            Play
                    </Button>
                        <Button
                            className="MUIbuttons"
                            disabled={actionButtons}
                            variant="contained"
                            color="primary"
                            endIcon={<SendIcon>Send</SendIcon>}
                            onClick={sendAudio}
                        >
                            Send
                    </Button>
                        <Button
                            className="MUIbuttons deleteButton"
                            disabled={actionButtons}
                            variant="outlined"
                            color="secondary"
                            startIcon={<DeleteIcon />}
                            onClick={deleteRecording}
                        >
                            Delete
                    </Button>
                        <IconButton onClick={() => {
                            setIsVoiceRecorder(false)
                            setData({});
                        }}>
                            <CloseIcon fontSize="large" className="soundRecorder__closeIcon" />
                        </IconButton>
                    </div>
                </div>
            </div>
        </Grow>
    )
}

export default SoundRecorder
