import React from "react";
import { connect } from "react-redux";
var fileDownload = require('js-file-download');
import Jup from "../Jupyter/Jupyter";

const mapMessaggi = state => {
    return { messaggi: state.messaggi };
};

class ConnectedJupyter extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            savedJup: ' Save'
        }

        this.saveJupyter = this.saveJupyter.bind(this);
    }

    generateJSON(){
        var json_jup = new Jup();

        this.props.messaggi.map(el =>{
            if(el.code != null)
                json_jup.addCode(el.output, el.code);
            else
                json_jup.addMarkdown(el.who, el.messaggio); 
        });

        return json_jup;
    }

    saveJupyter(e){
        this.setState({ savedJup: 'Saved' });
        var ipynb = this.generateJSON();

        var today = new Date();
        var ora = today.getHours() + '-' + today.getMinutes() + '_';
        var dd = today.getDate();
        var mm = today.getMonth()+1;
        var yyyy = today.getFullYear();
        var date = dd + "-" + mm + "-" + yyyy;

        fileDownload(JSON.stringify(ipynb,  null, '\t'), ora + date + '.ipynb');
    }

    render(){
        return(
            <button className="button-board-lateral" onClick={this.saveJupyter}><i className="material-icons">file_download</i>{this.state.savedJup}</button>
        );
    }
}

const Jupyter = connect(mapMessaggi)(ConnectedJupyter);
export default Jupyter;