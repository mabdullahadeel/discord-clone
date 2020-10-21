import React, { useState, useEffect } from 'react';
import './SidebarChannel.css';
import { setChannelInfo } from '../features/appSlice';
// Avatars
import { Avatar } from '@material-ui/core';
import OnlineAvatar from './OnlineAvatar';
import OfflineAvatar from './OfflineAvatar';
// Redux
import { useDispatch, useSelector } from 'react-redux';
import { seletChannelName } from '../features/appSlice';
// firebase
import db from '../firebase/firebase';

function SidebarChannel({ id, channelCredientials }) {
    const dispatch = useDispatch();
    const conversationInfo = useSelector(seletChannelName);
    const [userStatus, setUserStatus] = useState('offline');

    useEffect(() => {
        db.collection('users').where('uid', '==', channelCredientials.uid).onSnapshot((snapshot) =>
            (snapshot.docs.map((doc) => (
                setUserStatus(doc.data().status)
            )))
        )
    }, [])

    return (
        <div className={`sidebarChannel ${conversationInfo && (channelCredientials.uid === conversationInfo.uid && "sidebarChannel--active")}`} onClick={() => dispatch(setChannelInfo({
            channelId: id,
            channelCredientials: channelCredientials
        }))}>
            <h4>
                <div className="sidebarChannel__hash mr-3">
                    <div className="avatar">
                        {userStatus === "online" ?
                            <OnlineAvatar alter={channelCredientials.dispalayName} source={channelCredientials.photo} />
                            :
                            <OfflineAvatar alter={channelCredientials.dispalayName} source={channelCredientials.photo} />
                        }
                    </div>
                    <div>#{channelCredientials.dispalayName}</div>
                </div>

            </h4>
        </div>
    )
}

export default SidebarChannel
