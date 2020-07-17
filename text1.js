import React from 'react';
import ReactDOM from 'react-dom';
import RTCMultiConnection from './RTCMultiConnection.js';
import Helmet from "react-helmet";
import moment from "moment";
import Select from "react-select";
import ad from './nokia-1110-old-3504.mp3';

const connection = new RTCMultiConnection();
connection.socketURL = 'https://young-ridge-01369.herokuapp.com/';
connection.autoCloseEntireSession = false;
connection.enableLogs = false;
connection.session = {data: true};
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

    const [enableReceiveButton, setEnableReceiveButton] = React.useState(true);

    React.useEffect(() => {

        connection.onopen = event => {
            setUserid(connection.extra.name + ' [' + connection.userid + ']');
        };

        connection.onmessage = event => {
            if (event.data.type === 'USER') {
                setMessage(message => [...message, {
                    message: event.data.body,
                    sender: event.extra.name + ' [' + event.userid + ']'
                }]);
            }else if (event.data.type === 'SYSTEM') {
                setEnableReceiveButton(false);
            } else {
                alert('Message Error');
            }
        };

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

        connection.openOrJoin("say", (isRoomCreated, roomid, error) => {
            if (connection.isInitiator === true) {
                setInitator(true);
            } else {
                setInitator(false);
            }
        });

    }, []);

    const headerStyle = {backgroundColor: "indigo", fontFamily: "Arial", padding: "10px", color: "white"};

    const sendToUser = (e) => {
        let payload = {
            type: 'USER',
            body: sendingMessage
        };
        if (Array.isArray(particularUser) && particularUser.length) {
            particularUser.forEach(pu => {
                connection.send(payload, pu.value);
            });
        } else {
            connection.send(payload);
        }
    };


    const call = () => {
        let payload = {
            type: 'SYSTEM',
            body: 'Hay I am calling u'
        };
        console.log('going to call...' + particularUser[0].value);
        connection.send(payload, particularUser[0].value);
        window.open("https://newgen.vercel.app/?roomid=say",
            "_blank",
            "toolbar=yes,scrollbars=yes,resizable=yes,top=100,left=500,width=400,height=400");
    };

    const receive = () => {
        window.open("https://newgen.vercel.app/?roomid=say",
            "_blank",
            "toolbar=yes,scrollbars=yes,resizable=yes,top=100,left=500,width=400,height=400");
    };

    return <div>
        <p style={headerStyle}>Username: {userid}</p>

        {initator && <p style={{color: "DarkRed"}}>Teacher</p>}
        {!initator && <p style={{color: "green"}}>Student</p>}

        <input type="text" onChange={(e) => setSendingMessage(e.target.value)}/>
        <br/><br/>
        <div style={{width: "40%"}}>
            <Select onChange={v => setParticularUser(v)} isMulti options={options}/>
        </div>
        <br/><br/>
        <button onClick={sendToUser}>Send</button>
        <br/><br/>
        <button onClick={call}>Call</button>
        <br/><br/>
        <button onClick={receive} disabled={enableReceiveButton}>Receive</button>

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