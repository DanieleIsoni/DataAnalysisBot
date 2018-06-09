import React from "react";
import axios from 'axios';
import uuidv1 from "uuid";
import { connect } from "react-redux";
import { CSSTransitionGroup } from 'react-transition-group';
import Message from './Message/Content';
import Output from './Message/Output';

const mapMessage = state => {
    return { messaggi: state.messaggi.present };
};

class ConnectedMessages extends React.Component {
    constructor(props){
        super(props);
        this.state = { openCode: '' }
    }

    componentDidMount() { this.scrollToBottom(); }
    componentDidUpdate() { this.scrollToBottom(); } 

    scrollToBottom(){ this.messagesEnd.scrollIntoView({ behavior: "smooth" }); }

    openCode(e, id){
        this.setState({ openCode: (this.state.openCode) ? '' : id });
    }

    render(){
        const list = this.props.messaggi.map((el, n) => {
            return(
                <li key={el.id} id={el.id}>              
                    <Message content={el} n={n} isCodeOpen={this.state.openCode} openCode={this.openCode}/>
                    <Output output={el.output} n={n} />
                </li>
            );
        });

        return(
            <div className="scroll_container">
                <ul className="chat-thread">
                    <CSSTransitionGroup transitionName="example" transitionEnterTimeout={500} transitionLeaveTimeout={300}>
                        {list}
                        <li style={{ float:"left", clear: "both" }} ref={(el) => { this.messagesEnd = el; }}></li>
                    </CSSTransitionGroup>
                </ul>
            </div>
        );
    }
}

const Messages = connect(mapMessage)(ConnectedMessages);
export default Messages;