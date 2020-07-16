import React from 'react';
import RTCMultiConnection from "./RTCMultiConnection.js";
import moment from "moment";

const VideoServer = props => {

    let connection;

    React.useEffect(() => {

        console.log("VideoServer ...");
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

        connection.openOrJoin(props.room, (isRoomExist, roomid, error) => {
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
            // console.log(event.mediaElement);

            let video = document.createElement('video');
            try {
                video.setAttributeNode(document.createAttribute('autoplay'));
                video.setAttributeNode(document.createAttribute('playsinline'));
            } catch (e) {
                video.setAttribute('autoplay', true);
                video.setAttribute('playsinline', true);
            }

            if(event.type === 'local') {
                video.classList.add("local");
                video.volume = 0;
                try {
                    video.setAttributeNode(document.createAttribute('muted'));
                } catch (e) {
                    video.setAttribute('muted', true);
                }
            }

            if (event.type === 'remote') {
                video.classList.add("remote");
            }

            video.srcObject = event.stream;
            connection.videosContainer.appendChild(video);
            document.body.insertBefore(video, document.body.firstChild);
        };

    }, []);

    const receiveCall = () => {
        alert('receiveCall');
    };

    const rejectCall = () => {
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
        <div className="content">
            <div>
                <a onClick={receiveCall} className="fa fa-phone"/>
                <a onClick={rejectCall} className="fa fa-circle"/>
            </div>
            <p>Calling...</p>
        </div>
    </>;
};

export default VideoServer;

