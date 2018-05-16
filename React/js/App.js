import React from "react";
import Chat from "./Component/Chat";
import Sidemenu from "./Component/Sidemenu";
import { connect } from "react-redux";
import Form from "./Component/Form";

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
                {
                    (this.state.side == "block") ?
                    <div className="openSide" onClick={this.handleClick}><i className="material-icons">keyboard_arrow_down</i></div>
                    :
                    ""
                } 
            </div>   
        );
    }
}