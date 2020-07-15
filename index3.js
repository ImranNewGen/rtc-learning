import React from 'react';
import ReactDOM from 'react-dom';
import RTCMultiConnection from './RTCMultiConnection.js';
import moment from "moment";

var randomstring = require("randomstring");

const headerStyle = {backgroundColor: "rgb(66,22,6)", fontFamily: "Arial", padding: "10px", color: "white"};

function Main() {

    const [userid, setUserid] = React.useState();
    const [roomName, setRoomName] = React.useState("say");
    let connection;

    React.useEffect(() => {

    },[]);

    const callStart = roomName => {

        connection = new RTCMultiConnection();
        connection.socketURL = 'https://young-ridge-01369.herokuapp.com/';
        connection.enableLogs = false;
        connection.autoCreateMediaElement = false;
        connection.sdpConstraints.mandatory = {
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: true
        };
        connection.extra = {
            joinedAt: moment().format()
        };
        connection.session = {audio: true, video: true};

        connection.onopen = event => {
            setUserid(connection.extra.name + ' [' + connection.userid + ']');
        };

        connection.openOrJoin(roomName, (isRoomExist, roomid, error) => {
            console.log(roomid + ' Created, Call API');
            if (error) {
                alert(error);
            }
        });

        connection.onstream = function(event) {
            // let video = event.mediaElement;
            // video.id = event.streamid;
            // video.controls = false;
            // video.classList.add("mystyle");
            // document.body.insertBefore(video, document.body.firstChild);
            console.log(event.mediaElement);

            let video = document.createElement('video');
            try {
                video.setAttributeNode(document.createAttribute('autoplay'));
                video.setAttributeNode(document.createAttribute('playsinline'));
            } catch (e) {
                video.setAttribute('autoplay', true);
                video.setAttribute('playsinline', true);
            }

            if(event.type === 'local') {
                video.volume = 0;
                try {
                    video.setAttributeNode(document.createAttribute('muted'));
                } catch (e) {
                    video.setAttribute('muted', true);
                }
            }
            video.srcObject = event.stream;
            connection.videosContainer.appendChild(video);
            document.body.insertBefore(video, document.body.firstChild);
        };
    };

    const callEnd = () => {
        connection.getAllParticipants().forEach(function(pid) {
            connection.disconnectWith(pid);
        });
        // stop all local cameras
        connection.attachStreams.forEach(function(localStream) {
            localStream.stop();
        });
        // close socket.io connection
        connection.closeSocket();
    };

    return <>
        <p style={headerStyle}>Username: {userid}</p>

        <input type="text" value={roomName} onChange={(e) => setRoomName(e.target.value)}/><br/><br/>
        <p>{roomName}</p>
        <br/><br/>

        <button onClick={()=>{callStart(roomName);}}>Call</button><br/><br/>
        <button onClick={callEnd}>End</button>

    </>;
}

ReactDOM.render(<Main/>, document.querySelector('#app'));