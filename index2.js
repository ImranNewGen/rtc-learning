import React from 'react';
import ReactDOM from 'react-dom';
import RTCMultiConnection from './RTCMultiConnection.js';
import Helmet from "react-helmet";
import moment from "moment";
import Select from "react-select";

const connection = new RTCMultiConnection();
connection.socketURL = 'https://young-ridge-01369.herokuapp.com/';
// connection.autoCloseEntireSession = true;
connection.enableLogs = false;
connection.session = {
    data: true
};
connection.sdpConstraints.mandatory = {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true
};

connection.extra = {
    joinedAt: moment().format(),
    name: prompt("Enter Name")
};

function Main() {

    console.log(123);

    const [userid, setUserid] = React.useState();
    const [particularUser, setParticularUser] = React.useState();
    const [message, setMessage] = React.useState([]);
    const [sendingMessage, setSendingMessage] = React.useState();
    const [initator, setInitator] = React.useState(false);

    const [options, setOptions] = React.useState([]);
    const [userlist, setUserlist] = React.useState([]);

    const [peerSreamId, setPeerSreamId] = React.useState();

    React.useEffect(() => {
        console.log(456);

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

       

    }, []);

    const headerStyle = {backgroundColor: "rgb(66,22,6)", fontFamily: "Arial", padding: "10px", color: "white"};

    const sendToUser = (e) => {
   
        var peerStreams = [];

        Object.keys(connection.streamEvents).forEach(function(streamid) {
            var event = connection.streamEvents[streamid];
            
            if (event.userid === particularUser[0].value) {
                peerStreams.push(event.mediaElement);
            }
        });
       
        
        if (Array.isArray(peerStreams) && peerStreams.length) {
           console.log(peerStreams[0]);
           document.body.appendChild( peerStreams[0]);
           setPeerSreamId(peerStreams[0].id);
        }else{
            alert('Not Found');
        }  


    };

    const handleChange = (values) => {
        setParticularUser(values);
    };

    const call = (values) => {
       connection.peers[particularUser[0].value].addStream({
            audio: false,
            video: true,
            streamCallback: function(stream) {
                console.log('Screen is successfully captured: ' + stream.getVideoTracks().length);
            }
        });
    };

    const stop = (values) => {
        var existing = document.getElementById(peerSreamId);
        if(existing && existing.parentNode) {
          existing.parentNode.removeChild(existing);
        }
    };

    connection.onstream = function(event) {
        // console.log(event);
        // var video = document.createElement('video');
        // video.srcObject = event.stream;
        // document.body.appendChild( event.mediaElement );
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
        <br/><br/>

        <button onClick={call}>Call</button>
        <button onClick={stop}>Stop</button>
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