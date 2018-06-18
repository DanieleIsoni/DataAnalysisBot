import React from "react";
import { connect } from "react-redux";
import { CSSTransitionGroup } from 'react-transition-group';
import Message from './Message/Content';
import Output from './Message/Output';
import { getAll} from '../../Actions/Axios'
import { Link, Element , Events, animateScroll as scroll, scrollSpy, scroller } from 'react-scroll'

const mapMessage = state => {
    return { messaggi: state.messaggi.present };
};

class ConnectedMessages extends React.Component {
    constructor(props){
        super(props);
        this.state = { openCode: '' }
        this.openCode = this.openCode.bind(this);
    }

    componentWillMount() { 
        getAll().then(() => {}).catch(error => { console.log(error) });
    }

    componentDidUpdate() { this.scrollToBottom(1000); } 

    scrollToBottom(time){ 
        scroller.scrollTo('lastelement', {
            duration: time,
            smooth: true,
            containerId: 'scroll'
          }); 
    }

    openCode(e, id){
        this.setState({ openCode: (this.state.openCode) ? '' : id });
    }

    render(){
        const list = this.props.messaggi.map((el, n) => {
            return(
                <li key={el.id} id={el.id} >              
                    <Message content={el} n={n} isCodeOpen={this.state.openCode} openCode={this.openCode}/>
                    <Output output={el.output} n={n} />
                </li>
            );
        });

        return(
            <div className="scroll_container" id="scroll">
                <ul className="chat-thread" ref={(list) => {this.mlist = list}}>
                    <CSSTransitionGroup transitionName="example" transitionEnterTimeout={300} transitionLeaveTimeout={300}>
                        {list}                  
                    </CSSTransitionGroup>
                    <Element name="lastelement"></Element>  
                </ul>
            </div>
        );
    }
}

const Messages = connect(mapMessage)(ConnectedMessages);
export default Messages;