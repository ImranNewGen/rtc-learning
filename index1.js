import React from 'react';
import ReactDOM from 'react-dom';
import RTCMultiConnection from './RTCMultiConnection.js';

const connection = new RTCMultiConnection();
connection.socketURL = 'https://young-ridge-01369.herokuapp.com/';
connection.socketMessageEvent = 'say';
connection.autoCloseEntireSession = true;
connection.session = {
    data: true
};

function Main() {

    const [userid, setUserid] = React.useState();
    const [particularUser, setParticularUser] = React.useState();
    const [message, setMessage] = React.useState([]);
    const [sendingMessage, setSendingMessage] = React.useState();
    const [initator, setInitator] = React.useState(false);
    const [userlist, setUserlist] = React.useState([]);

    React.useEffect(() => {

        connection.onopen = event => {
            setUserid(connection.userid);
            // console.log('===>Open: ' + connection.userid);
        };

        connection.onmessage = event => {
            // console.log('===>Message');
            // console.log(event.userid + ' said: ' + event.data);
            // setMessage(event.userid + ' said: ' + event.data);
            setMessage(message => [...message, {
                message: event.data,
                sender: event.userid
            }]);
        };

        connection.openOrJoin("say", (isRoomCreated, roomid, error) => {
            if (connection.isInitiator === true) {
                setInitator(true);
            } else {
                setInitator(false);
            }
        });

        connection.onUserStatusChanged = function(event) {
            // console.log("-----------------------------");
            // console.log(connection.getAllParticipants());
            setUserlist(connection.getAllParticipants());
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

    const sendMessage = (e) => {
        connection.send(sendingMessage);
    };

    const sendParticularUser = (e) => {
        // var peerContainer = connection.peers[particularUser];
        // connection.disconnectWith(particularUser);
        /*connection.getAllParticipants().forEach(function(pid) {
            connection.disconnectWith(pid);
        });*/
        connection.changeUserId(particularUser, function() {
           console.log('Your userid is successfully changed to: ' + connection.userid);
        });
    };

    return <div>
        <p style={headerStyle}>Username: {userid}</p>

        {initator && <p style={{color: "DarkRed"}}>Teacher</p>}
        {!initator && <p style={{color: "green"}}>Student</p>}

        <input type="text" name={"messageFld"} onChange={(e) => setSendingMessage(e.target.value)}/>
        <button onClick={sendMessage}>Send Message</button><br/><br/><br/>

        <input type="text" name={"particularUser"} onChange={(e) => setParticularUser(e.target.value)}/>
        <button onClick={sendParticularUser}>Send Particular User</button><br/>


        <p>Message:</p>
        <ul>
            {message.map((item, i) => (
                <li key={i}>{item.sender} ==> {item.message}</li>
            ))}
        </ul>
        <p>User List:</p>
        <ul>
            {userlist.map((item, i) => (
                <li key={i}>{item}</li>
            ))}
        </ul>


    </div>;
}

ReactDOM.render(<Main/>, document.querySelector('#app'));