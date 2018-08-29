import React from "react";
import { connect } from "react-redux";
import { CSSTransitionGroup } from 'react-transition-group';
import Message from './Message/Content';
import Output from './Message/Output';
import { getAll} from '../../Actions/Axios'
import { Link, Element , Events, animateScroll as scroll, scrollSpy, scroller } from 'react-scroll'

const mapMessage = state => {
    return { messages: state.messages.present };
};

/*
    Main interface with the list of request and output from the bot
*/
class ConnectedMessages extends React.Component {
    constructor(props){
        super(props);
        this.state = { openCode: '' }
        this.openCode = this.openCode.bind(this);
    }

    /*
        Before the interface completely load the component download all the messages and datasets in the session (if available)
    */
    componentWillMount() { 
        getAll().then(() => {
            this.scrollToBottom(1000);
        }).catch(error => {
            console.log(error)
        });
    }

    componentDidUpdate() { this.scrollToBottom(1000); } 

    /*
        Function used to scroll down in the chat every time is called
    */
    scrollToBottom(time){ 
        scroller.scrollTo('lastelement', {
            duration: time,
            smooth: true,
            containerId: 'scroll'
          }); 
    }

    /*
        With the ouput the server send the code executed. This function trigger the possibility to see it saving the message id
    */
    openCode(e, id){
        this.setState({ openCode: (this.state.openCode) ? '' : id });
    }

    render(){
        /* Object containing all the message */
        const list = this.props.messages.map((el, n) => {
            return(
                <li key={el.id} id={el.id} >              
                    <Message content={el} n={n} isCodeOpen={this.state.openCode} openCode={this.openCode}/>
                    <Output output={el.output} n={n} scroller={this.scroll}/>
                </li>
            );
        });

        return(
            <div className="scroll_container" id="scroll">
                <ul className="chat-thread" ref={(list) => {this.mlist = list}}>
                    <CSSTransitionGroup transitionName="example" transitionEnterTimeout={300} transitionLeaveTimeout={300}>
                        {list}                  
                    </CSSTransitionGroup>
                    {
                        /*
                            Empty ast element as a placeholder to scroll down
                         */
                        <Element name="lastelement"></Element>
                    }
                </ul>
            </div>
        );
    }
}

const Messages = connect(mapMessage)(ConnectedMessages);
export default Messages;