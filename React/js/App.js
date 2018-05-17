import React from "react";
import Chat from "./Component/Chat/Chat";
import Sidemenu from "./Component/Sidemenu/Sidemenu";
import { connect } from "react-redux";
import Form from "./Component/Control/Form";

export default class App extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            side: "none",
        }

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(e){
        this.setState({
            side: (this.state.side == "block") ? "none" : "block"
        })
    }

    render () {
        return (
            <div className="container-fluid">
                <div className="row">
                    <Chat />
                    <Sidemenu show={this.state.side}/>
                    <Form />
                </div>   
                <div className="openSide" onClick={this.handleClick}><i className="material-icons">keyboard_arrow_down</i></div>
            </div>   
        );
    }
}