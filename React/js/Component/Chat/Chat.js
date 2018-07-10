import './chat.css';
import React from "react";
import ChatMessages from './MessageList';
import { Col } from 'reactstrap';
import TabContext from './TabContext';

export default class Chat extends React.Component {
    render(){
        return (
            <Col xs="12" md="7" lg="8" className="chat">
                <TabContext />
                <ChatMessages /> 
            </Col>
        );
    }
}