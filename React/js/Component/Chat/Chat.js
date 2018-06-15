import './chat.css';
import React from "react";
import ChatMessages from './MessageList';
import { Col } from 'reactstrap';

export default class Chat extends React.Component {
    render(){
        return (
            <Col xs="12" md="8" lg="9" className="chat">
                <ChatMessages /> 
            </Col>
        );
    }
}