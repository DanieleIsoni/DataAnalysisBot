import React from "react";
import Messages from './MessageList';
import './chat.css';

export default class Chat extends React.Component {
    render(){
        return (
            <div className="chat col-12 col-md-8 col-lg-8">
                <div className="scroll_container">
                    <Messages /> 
                </div>
            </div>
        );
    }
}