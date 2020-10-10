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
        <div className={`message ${currUser.uid === user.uid && "ml-auto"}`}>
            {currUser.uid === user.uid ?
                <>
                    <div className="message__info spec">
                        <h4>{user.dispalayName}
                            <span className="message__timestamp"><TimeAgo date={new Date(timestamp?.toDate()).toUTCString()} /></span>
                        </h4>
                        <h6>{message}</h6>
                    </div>
                    <Avatar src={user.photo} className="ml-4" />
                </>
                :
                <>
                    <Avatar src={user.photo} />
                    <div className="message__info">
                        <h4>{user.dispalayName}
                            <span className="message__timestamp"><TimeAgo date={new Date(timestamp?.toDate()).toUTCString()} /></span>
                        </h4>
                        <h6>{message}</h6>
                    </div>
                </>
            }

        </div>
    )
}

export default Message
