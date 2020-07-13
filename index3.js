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

// STAR_FIX_VIDEO_AUTO_PAUSE_ISSUES
// via: https://github.com/muaz-khan/RTCMultiConnection/issues/778#issuecomment-524853468
var bitrates = 512;
var resolutions = 'Ultra-HD';
var videoConstraints = {};

if (resolutions == 'HD') {
    videoConstraints = {
        width: {
            ideal: 1280
        },
        height: {
            ideal: 720
        },
        frameRate: 30
    };
}

if (resolutions == 'Ultra-HD') {
    videoConstraints = {
        width: {
            ideal: 1920
        },
        height: {
            ideal: 1080
        },
        frameRate: 30
    };
}

connection.mediaConstraints = {
    video: videoConstraints,
    audio: true
};

var CodecsHandler = connection.CodecsHandler;

connection.processSdp = function(sdp) {
    var codecs = 'vp8';

    if (codecs.length) {
        sdp = CodecsHandler.preferCodec(sdp, codecs.toLowerCase());
    }

    if (resolutions == 'HD') {
        sdp = CodecsHandler.setApplicationSpecificBandwidth(sdp, {
            audio: 128,
            video: bitrates,
            screen: bitrates
        });

        sdp = CodecsHandler.setVideoBitrates(sdp, {
            min: bitrates * 8 * 1024,
            max: bitrates * 8 * 1024,
        });
    }

    if (resolutions == 'Ultra-HD') {
        sdp = CodecsHandler.setApplicationSpecificBandwidth(sdp, {
            audio: 128,
            video: bitrates,
            screen: bitrates
        });

        sdp = CodecsHandler.setVideoBitrates(sdp, {
            min: bitrates * 8 * 1024,
            max: bitrates * 8 * 1024,
        });
    }

    return sdp;
};
// END_FIX_VIDEO_AUTO_PAUSE_ISSUES

// https://www.rtcmulticonnection.org/docs/iceServers/
// use your own TURN-server here!
connection.iceServers = [];

connection.iceServers.push({
    'urls': [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
        'stun:stun.l.google.com:19302?transport=udp',
    ]
});

connection.iceServers.push({
    urls: 'turn:numb.viagenie.ca',
    credential: 'imran2003jeba',
    username: 'imran.islam011@gmail.com'
});

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

    const [receiveButton, setReceiveButton] = React.useState(true);
    const [senderId, setSenderId] = React.useState(null);

    React.useEffect(() => {

        connection.onopen = event => {
            setUserid(connection.extra.name + ' [' + connection.userid + ']');
        };

        connection.onmessage = event => {

            if (event.data === 'CALL') {
                setReceiveButton(false);
                setSenderId(event.userid);

                connection.addStream({
                    audio: true,
                    video: true,
                    streamCallback: function(stream) {
                        console.log('Screen is successfully captured: ' + stream.getVideoTracks().length);
                    }
                });
                connection.renegotiate();

            }
            else if (event.data === 'RECEIVE') {
                console.log("RECEIVE");
                console.log(event.userid);
                Object.keys(connection.streamEvents).forEach(function(streamid) {
                    let e = connection.streamEvents[streamid];
                    console.log(e);
                });
                // viewPeer(event.userid);
            } else {
                setMessage(message => [...message, {
                    message: event.data,
                    sender: event.extra.name + ' [' + event.userid + ']'
                }]);
            }
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

    const handleChange = (values) => {
        setParticularUser(values);
    };

    const callToUser = () => {

        let peerStreams = [];

        Object.keys(connection.streamEvents).forEach(function(streamid) {
            let event = connection.streamEvents[streamid];
            if (event.userid === particularUser[0].value) {
                peerStreams.push(event);
            }
        });


        if (Array.isArray(peerStreams) && peerStreams.length) {
            console.log("Unmute");
            peerStreams[0].stream.unmute();
            document.body.appendChild(peerStreams[0].mediaElement);
        }else{
            alert('Not Found');
        }
    };

    const viewPeer = (peerId) => {

        let peerStreams = [];

        Object.keys(connection.streamEvents).forEach(function(streamid) {
            let event = connection.streamEvents[streamid];
            if (event.userid === peerId) {
                peerStreams.push(event);
            }
        });


        if (Array.isArray(peerStreams) && peerStreams.length) {
            console.log("Unmute");
            peerStreams[0].stream.unmute();
            document.body.appendChild(peerStreams[0].mediaElement);
        }else{
            alert('Not Found');
        }
    };

    const textToUser = () => {
        connection.send(sendingMessage, particularUser[0].value);
    };

    const receiveCall = () => {
        setReceiveButton(true);
        viewPeer(senderId);
        connection.send('RECEIVE', senderId);
    };

    const call = (values) => {
        /*connection.addStream({
            audio: true,
            video: true,
            streamCallback: function(stream) {
                console.log('Screen is successfully captured: ' + stream.getVideoTracks().length);
                connection.send("CALL", particularUser[0].value);
                Object.keys(connection.streamEvents).forEach(function(streamid) {
                    let event = connection.streamEvents[streamid];
                    if (event.userid === connection.userid) {
                        console.log(event);
                        event.stream.unmute();
                        document.body.appendChild(event.mediaElement);
                    }
                });
            }
        });*/
        connection.send("CALL", particularUser[0].value);
    };

    const stop = (values) => {
        connection.attachStreams.forEach(function(stream) {
            console.log(stream.id);
            stream.getTracks().forEach(track => {
                track.stop();
            });
        });
    };

    connection.onstream = function(event) {
        /*let existing = document.getElementById(event.streamid);
        if(existing && existing.parentNode) {
            existing.parentNode.removeChild(existing);
        }

        event.mediaElement.removeAttribute('src');
        event.mediaElement.removeAttribute('srcObject');
        event.mediaElement.muted = true;
        event.mediaElement.volume = 0;

        let video = document.createElement('video');

        try {
            video.setAttributeNode(document.createAttribute('autoplay'));
            video.setAttributeNode(document.createAttribute('playsinline'));
        } catch (e) {
            video.setAttribute('autoplay', true);
            video.setAttribute('playsinline', true);
        }

        if(event.type === 'local'){
            video.volume = 0;
            try {
                video.setAttributeNode(document.createAttribute('muted'));
            } catch (e) {
                video.setAttribute('muted', true);
            }
        }
        video.srcObject = event.stream;*/
        console.log(event.type);

        if(event.type === 'local') {

        }

        if (event.type === 'remote') {

            Object.keys(connection.streamEvents).forEach(function (streamid) {
                let event = connection.streamEvents[streamid];
                if (event && event.stream) {
                    event.stream.mute();
                    console.log("Muted");
                };

            });
        }

    };

    const headerStyle = {backgroundColor: "rgb(226, 87, 37)", fontFamily: "Arial", padding: "10px", color: "white"};


    return <div>
        <p style={headerStyle}>Username: {userid}</p>

        {initator && <p style={{color: "DarkRed"}}>Teacher</p>}
        {!initator && <p style={{color: "green"}}>Student</p>}

        <input type="text" name="sendingMessage" onChange={(e) => setSendingMessage(e.target.value)}/><br/><br/>
        <div style={{width:"40%"}}>
            <Select onChange={handleChange} isMulti options={options}/>
        </div><br/><br/>
        <button onClick={call}>Call to User</button>
        <br/><br/>

        <button onClick={receiveCall} disabled={receiveButton}>Receive</button>
        <br/><br/>

        <button onClick={textToUser}>Text to User</button>
        <br/><br/>

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