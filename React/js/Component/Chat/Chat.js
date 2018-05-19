import './chat.css';

import React from "react";
import Messages from './MessageList';
import { Col } from 'reactstrap';

export default class Chat extends React.Component {
    render(){
        return (
            <Col xs="12" md="8" className="chat">
                <div className="scroll_container">
                    <Messages /> 
                </div>
            </Col>
        );
    }
}