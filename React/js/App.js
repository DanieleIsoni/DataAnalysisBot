import React from "react";
import Chat from "./Component/Chat";
import Sidemenu from "./Component/Sidemenu";
import { connect } from "react-redux";

export default class App extends React.Component {
    render () {
        return (
            <div className="container-fluid">
                <div className="row">
                    <Chat />
                    <Sidemenu />
                </div>    
            </div>   
        );
    }
}