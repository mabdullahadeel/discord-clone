import React from 'react';
import FlipMove from 'react-flip-move';
import SidebarChannel from './SidebarChannel';

const ChannelList = React.forwardRef((props, ref) => (
    <FlipMove delay={300}>
        {props.conversation.map(convers => (
            <div key={convers.id}>
                <SidebarChannel
                    key={convers.id}
                    channelCredientials={convers.channel.otherPerson}
                    id={convers.id}
                    {...convers}
                />
            </div>
        )
        )}
    </FlipMove>
))

export default ChannelList
