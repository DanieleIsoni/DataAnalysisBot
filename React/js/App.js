import React from "react";
import Chat from "./Component/Chat";
import Sidemenu from "./Component/Sidemenu";
import { connect } from "react-redux";
import Form from "./Component/Form";

export default class App extends React.Component {
    render () {
        return (
            <div className="container-fluid">
                <div className="row">
                    <Chat />
                    <Sidemenu />
                    <Form />
                </div>    
            </div>   
        );
    }
}