import React, { useEffect, useState } from 'react';
import './DropZone.css';

// firebase
import db from '../firebase/firebase';
import firebase from 'firebase';
// Redux
import { selectUser } from '../features/userSlice';
import { selectChannelId } from '../features/appSlice';
import { useSelector } from 'react-redux';
// MUI
import { Button, Snackbar, Zoom } from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';
import CircularProgress from '@material-ui/core/CircularProgress';
import MuiAlert from '@material-ui/lab/Alert';
import { useDropzone } from 'react-dropzone';

function DropZone({ isDropZoneOpen, setIsDropZoneOpen }) {
    const [files, setFiles] = useState([]);
    const [sendButton, setSendButton] = useState(true);
    const { getRootProps, getInputProps } = useDropzone({
        maxFiles: 1,
        accept: 'image/png, image/jpeg, image/gif,',
        onDrop: acceptedFiles => {
            setFiles(acceptedFiles.map(file => Object.assign(file, {
                preview: URL.createObjectURL(file)
            })));
        }
    });

    const thumbs = files.map(file => (
        <div className="dropZone__previewFile" key={file.name}>
            <div className="dropZone__previewFileInner" >
                <img className="dropzone__previewImage"
                    src={file.preview} />
            </div>
        </div>
    ));

    useEffect(() => () => {
        // Make sure to revoke the data uris to avoid memory leaks
        files.forEach(file => URL.revokeObjectURL(file.preview));
    }, [files]);

    function Alert(props) {
        return <MuiAlert elevation={6} variant="filled" {...props} />;
    }

    // Send Images
    // Error Handling
    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setError(null);
    };
    const [error, setError] = useState(null);
    const user = useSelector(selectUser);
    const channelId = useSelector(selectChannelId);
    const [progressBarPercentage, setProgressBarPercentage] = useState(0);

    const sendImage = async () => {
        const file = files[0]
        // Some Cool Firebase Magic Goes Here
        // Firebase Storage
        const storageRef = firebase.storage().ref('ImageMessages/' + "Image");
        if (file.size <= 300000) {
            const task = storageRef.put(file);
            await task.on('state_changed',
                // Progress of the Current Upload
                function progress(snapshot) {
                    setSendButton(false);
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
                        setIsDropZoneOpen(false);
                        setFiles([])
                        // Creating message in the firestore
                        db.collection('users').doc(user.email).collection('chats').doc(channelId).collection('messages').add({
                            message: {
                                MessageType: "ImageMessage",
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
                                MessageType: "ImageMessage",
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
        } else {
            setError("You can send max 500KB of image size.");
        }

    }

    return (
        <>
            <Zoom in={isDropZoneOpen} style={{ transitionDelay: isDropZoneOpen ? '200ms' : '0ms' }}>
                <div className="dropZone">
                    <section className="">
                        <div {...getRootProps({ className: 'dropzone' })}>
                            <input {...getInputProps()} />
                            <p>Drag 'n' drop some files here, or click to select file</p>
                        </div>
                        <aside className="dropZone__previewContainer">
                            {thumbs}
                            {progressBarPercentage > 0 &&
                                <CircularProgress variant="static" value={progressBarPercentage} />
                            }
                            {(files.length !== 0 && sendButton) &&
                                <Button
                                    onClick={sendImage}
                                    className="dropZone__send"
                                    disabled={files.length === 0}
                                    variant="contained"
                                    color="primary"
                                    endIcon={<SendIcon>send</SendIcon>}
                                >
                                    Send
                    </Button>
                            }
                        </aside>
                    </section>
                </div>
            </Zoom>
            <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} open={error} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity="error">
                    {error}
                </Alert>
            </Snackbar>
        </>
    )
}

export default DropZone
