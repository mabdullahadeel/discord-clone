import React from 'react';
import './ChatHeader.css';

// Mui Icons
import NotificationsIcon from '@material-ui/icons/Notifications';
import EditLocationIcon from '@material-ui/icons/EditLocation';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import SearchIcon from '@material-ui/icons/Search';
import SendIcon from '@material-ui/icons/Send';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';

function ChatHeader({ channelName, email }) {
    return (
        <div className="chatHeader">
            <div className="chatHeader__left">
                <h3>
                    <span className="chatHeader__hash">
                        #
                        </span>
                    {channelName}
                </h3>
                <div className="chatHeader__emailStatus">
                    <p>{email}</p>
                </div>
            </div>
            <div className="chatHeader__right">
                <NotificationsIcon />
                <EditLocationIcon />
                <PeopleAltIcon />

                <div className="chatHeader__search">
                    <input placeholder="Search" />
                    <SearchIcon />
                </div>
                <SendIcon />
                <HelpOutlineIcon />
            </div>
        </div>
    )
}

export default ChatHeader
