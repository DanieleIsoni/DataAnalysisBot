import React from "react";
import axios from 'axios';
import uuidv1 from "uuid";
import { connect } from "react-redux";
import { addMessaggio, editMessaggio } from "../../Actions/index";
import { CSSTransitionGroup } from 'react-transition-group';
import Code from './Code';
import Choices from './Choices';
import { UrlContext } from '../../Config/Url';

const mapMessaggi = state => {
    return { messaggi: state.messaggi.present };
};


class ConnectedMessages extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            selected: '',
            openCode: ''
        }
        this.handleListClick = this.handleListClick.bind(this);
    }

    scrollToBottom(){ this.messagesEnd.scrollIntoView({ behavior: "smooth" }); }
      
    componentDidMount() { this.scrollToBottom(); }
    componentDidUpdate() { this.scrollToBottom(); }

    handleListClick (e, id){
        this.setState({ selected: id });
    }

    openCode(e, id){
        this.setState({ openCode: (this.state.openCode) ? '' : id });
    }


    render(){
        const list = this.props.messaggi.map((el, n) => {
            return(
                <li key={el.id} id={el.id} onClick={(e) => this.handleListClick(e, el.id)} >              
                    {
                        (el.code != null) ? 
                            (
                                <div>
                                    <div className="line">
                                        <span className="incode-markdown">{n}</span>
                                        <div className="markdown">
                                            <div className={el.who}>
                                            {el.messaggio}
                                            {
                                                (el.id === this.state.openCode) ?
                                                <a className="code_command" onClick={(e) => this.openCode(e, el.id)}><i className="material-icons">code</i> Close</a>
                                                :
                                                <a className="code_command" onClick={(e) => this.openCode(e, el.id)}><i className="material-icons">code</i> View the Code</a>
                                            }
                                            </div>
                                        </div>
                                    </div>
                                    {
                                    (el.id === this.state.openCode) ?
                                        <div className="line">
                                            <span className="incode">In [ {n} ]: </span>
                                                <Code code={el.code} />   
                                        </div>
                                        :
                                        ""
                                    }
                                </div>
                            )
                        :
                        (
                            <div className="line">
                                <span className="incode-markdown">{n}</span>
                                <div className={el.what}>
                                    <div className={el.who}>{el.messaggio}</div>
                                </div>
                            </div>
                        )
                    }
                    { 
                        (typeof el.output != "undefined" && el.output != null && el.output.length > 0) ? (
                            <div className="output-area">
                                <span className="outcode">Out [ {n} ]: </span>
                                {
                                    el.output.map((al, i) => {
                                        return(
                                            <div className="resultdiv" key={i}>
                                                {
                                                    (al.type == "image/png") ? 
                                                        (al.content == "define") ? 
                                                        <pre>Grafico non generato</pre>
                                                        :
                                                        <div>
                                                            <img className="plot_img" src={"data:image/gif;base64," + al.content}/> 
                                                            <UrlContext.Consumer>
                                                                {url => <Choices {...this.props} image={al.content} url={url} /> }
                                                            </UrlContext.Consumer>
                                                        </div>
                                                    :
                                                    <pre>{al.content}</pre>
                                                }
                                            </div>
                                        );
                                    })
                                }
                            </div>) 
                        : " "
                    }
                </li>
            );
        });

        return(
            <ul className="chat-thread">
                <CSSTransitionGroup
                    transitionName="example"
                    transitionEnterTimeout={500}
                    transitionLeaveTimeout={300}>
                    {list}
                    <li style={{ float:"left", clear: "both" }} ref={(el) => { this.messagesEnd = el; }}></li>
                </CSSTransitionGroup>
            </ul>
        );
    }
}

const Messages = connect(mapMessaggi)(ConnectedMessages);
export default Messages;