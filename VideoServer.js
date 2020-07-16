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
        /*connection.iceServers = [{
            'urls': [
                'stun:stun.l.google.com:19302',
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
                'stun:stun.l.google.com:19302?transport=udp',
            ]
        }];*/
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
            joinedAt: moment().format()
        };
        

        connection.openOrJoin(props.room, (isRoomExist, roomid, error) => {
            if (error) {
                alert(error);
            }
        });

        connection.onstream = function(event) {

            var existing = document.getElementById(event.streamid);
            if(existing && existing.parentNode) {
              existing.parentNode.removeChild(existing);
            }

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
            video.id = event.streamid;
            connection.videosContainer.appendChild(video);
            document.body.insertBefore(video, document.body.firstChild);
        };

        connection.onstreamended = function(event) {
            var video = document.getElementById(event.streamid);
            if (video && video.parentNode) {
                video.parentNode.removeChild(video);
            }
        };

    }, []);

   
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
        window.close();
    };

    return <>
        <div className="content">
            <a onClick={rejectCall} className="fa fa-phone"/>                
            <p>Calling...</p>
        </div>
    </>;
};

export default VideoServer;

