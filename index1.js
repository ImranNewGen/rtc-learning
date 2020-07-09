import React from 'react';
import ReactDOM from 'react-dom';
import RTCMultiConnection from './RTCMultiConnection.js';
import Helmet from "react-helmet";
import moment from "moment";
import Select from "react-select";

const connection = new RTCMultiConnection();
connection.socketURL = 'https://young-ridge-01369.herokuapp.com/';
connection.autoCloseEntireSession = true;
connection.enableLogs = false;
connection.session = {
    data: true
};
connection.extra = {
    joinedAt: moment().format(),
    name: prompt("Enter Name")
};

function Main() {

    const [userid, setUserid] = React.useState();
    const [particularUser, setParticularUser] = React.useState();
    const [message, setMessage] = React.useState([]);
    const [sendingMessage, setSendingMessage] = React.useState();
    const [initator, setInitator] = React.useState(false);

    const [options, setOptions] = React.useState([]);
    const [userlist, setUserlist] = React.useState([]);

    React.useEffect(() => {

        connection.onopen = event => {
            setUserid(connection.extra.name + ' [' + connection.userid + ']');
        };

        connection.onmessage = event => {
            setMessage(message => [...message, {
                message: event.data,
                sender: event.extra.name + ' [' + event.userid + ']'
            }]);
        };

        connection.openOrJoin("say", (isRoomCreated, roomid, error) => {
            if (connection.isInitiator === true) {
                setInitator(true);
            } else {
                setInitator(false);
            }
        });

        connection.onUserStatusChanged = function (event) {
            let users = connection.getAllParticipants().map(participantId => {
                let user = connection.peers[participantId];
                let joinedAt = user.extra.joinedAt;
                let name = user.extra.name;
                let hisUID = user.userid;
                let hisNativePeer = user.peer;
                let hisIncomingStreams = user.peer.getRemoteStreams();
                let hisDataChannels = user.channels;
                return {joinedAt,hisUID,hisNativePeer,hisIncomingStreams, hisDataChannels, name};
            });
            setUserlist(users);
            let a = users.map(m => ({
                value: m.hisUID,
                label: m.name
            }));

            setOptions(a);
        };

        /*connection.onNewParticipant = function(participantId, userPreferences) {
            if (connection.isInitiator === true) {
                let messa = participantId + ' is trying to join your room. Confirm to accept his request.';
                if( window.confirm(messa ) ) {
                    // connection.addParticipationRequest(participantId, userPreferences);
                    connection.acceptParticipationRequest(participantId, userPreferences);
                }
            }
        };*/


    }, []);

    const headerStyle = {backgroundColor: "indigo", fontFamily: "Arial", padding: "10px", color: "white"};

    const sendToUser = (e) => {
        if (Array.isArray(particularUser) && particularUser.length) {
            particularUser.forEach(pu => {
                connection.send(sendingMessage, pu.value);
            });
        } else {
            connection.send(sendingMessage);
        }
    };

    const handleChange = (values) => {
        setParticularUser(values);
    };

    return <div>
        <p style={headerStyle}>Username: {userid}</p>

        {initator && <p style={{color: "DarkRed"}}>Teacher</p>}
        {!initator && <p style={{color: "green"}}>Student</p>}

        <input type="text" name="sendingMessage" onChange={(e) => setSendingMessage(e.target.value)}/><br/><br/>
        <div style={{width:"40%"}}>
            <Select onChange={handleChange} isMulti options={options}/>
        </div><br/><br/>
        <button onClick={sendToUser}>Send</button>
        <br/>

        <p>User List:</p>
        <ul>
            {userlist.map((item, i) => (
                <li key={i}>{item.name}[{item.hisUID}] : {moment(item.joinedAt).fromNow()}</li>
            ))}
        </ul>

        <p>Message:</p>
        <ul>
            {message.map((item, i) => (
                <li key={i}>{item.sender} ==> {item.message}</li>
            ))}
        </ul>

        <Helmet>
            <title>{userid}</title>
        </Helmet>
    </div>;
}

ReactDOM.render(<Main/>, document.querySelector('#app'));