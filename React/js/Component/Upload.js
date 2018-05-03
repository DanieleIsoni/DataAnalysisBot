import React from "react";
import axios from 'axios';
import { connect } from "react-redux";
import { addVariabile, addMessaggio } from "../Actions/index";
import uuidv1 from "uuid";

const mapAddVariabileEvent = dispatch => {
    return {
      addVariabile: variabile => dispatch(addVariabile(variabile))
    };
};

class ConnectedUpload extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            filename: 'Upload...',
            showSend: 0
        };

        this.handlefileupload = this.handlefileupload.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handlefileupload(e){
        if(e.target.value){
            this.setState({ 
                filename: (e.target.value.split( '\\' ).pop()) ? e.target.value.split( '\\' ).pop() : "Upload...",
                showSend: 1,
                progress: 0,
            });
        }
    }

    handleSubmit(e){
        e.preventDefault();
        var file = this.fileInput.files[0];
        var formdata = new FormData();
        formdata.append('file', file);
        formdata.append('id', this.props.chatID);

        axios.post('https://data-analysis-bot.herokuapp.com/upload', formdata, {
            onUploadProgress: (progressEvent) => {
                const totalLength = progressEvent.lengthComputable ? progressEvent.total : progressEvent.target.getResponseHeader('content-length') || progressEvent.target.getResponseHeader('x-decompressed-content-length');
                if (totalLength !== null) {
                    this.setState({ progress: Math.round( (progressEvent.loaded * 100) / totalLength ) })
                }
            }
        }).then(response => {
                this.props.addVariabile({ "name": file.name, "id": uuidv1() });
                this.props.addMessaggio({"id": uuidv1(), "who": "bot", "what": "markdown", "messaggio": response.data.message, "output": []});
    
                this.setState({ showSend: 0, filename: "Seleziona..." });
        })
    }

    render(){
        return (
            <form action="/" method="POST" encType="multipart/form-data" className="form-upload" onSubmit={this.handleSubmit}>
                <input type="file" name="file" id="file" accept=".xls,.xlsx,.csv,.data" className="hidden_input" onChange={this.handlefileupload} ref={input => { this.fileInput = input; }} />
                <label className="upload-file" htmlFor="file">
                    <i className="material-icons">attach_file</i>
                    <span className="file-name">{this.state.filename}</span>
                </label>
                <button type="submit" className={(this.state.showSend) ? "show_send send-file" : "send-file"}><i className="material-icons">file_upload</i></button>
            </form>
        );
    }
}

const Upload = connect(null, mapAddVariabileEvent)(ConnectedUpload);
export default Upload;