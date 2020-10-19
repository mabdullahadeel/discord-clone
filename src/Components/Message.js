import React from 'react';
import './Message.css';
// MUI
import { Avatar } from '@material-ui/core';
// Redux
import { selectUser } from '../features/userSlice';
import { useSelector } from 'react-redux';
// time formatter
import TimeAgo from 'react-timeago';

function Message({ timestamp, user, message }) {
    const currUser = useSelector(selectUser);

    return (
        <>
            {currUser.uid === user.uid ?
                <div className="bubbleWrapper">
                    <div className="inlineContainer own">
                        <Avatar src={user.photo} alt={currUser.dispalayName} />
                        <div className="ownBubble own">
                            {message}
                        </div>
                    </div>
                    <span className="own">
                        <TimeAgo date={new Date(timestamp?.toDate()).toUTCString()} />
                    </span>
                </div>
                :
                <div className="bubbleWrapper">
                    <div className="inlineContainer">
                        <Avatar src={user.photo} alt={user.dispalayName} />
                        <div className="otherBubble other">
                            {message}
                        </div>
                    </div>
                    <span className="other">
                        <TimeAgo date={new Date(timestamp?.toDate()).toUTCString()} />
                    </span>
                </div>
            }
        </>
    )
}

export default Message