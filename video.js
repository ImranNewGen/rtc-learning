import React from 'react';
import ReactDOM from 'react-dom';
import VideoServer from "./VideoServer";

const params = new URLSearchParams(window.location.search);

const Main = () => {

    React.useEffect(() => {

    }, []);

    if (!Boolean(params.get('room'))) {
        return <p style={{color:"white"}}>Invalid Room ...</p>;
    }

    return <VideoServer room={params.get('room')}/>;
};

ReactDOM.render(<Main/>, document.querySelector('#app'));
