import React from "react";
import axios from 'axios';
import { connect } from "react-redux";
import { addVariabile, addMessaggio } from "../../Actions/index";
import uuidv1 from "uuid";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

const mapAddVariabileEvent = dispatch => {
    return {
      addVariabile: variabile => dispatch(addVariabile(variabile))
    };
};

class ConnectedUpload extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            filename: 'Upload file...',
            filesize: '',
            modal: false,
            progress: 0,
            showLoader: false
        }

        this.handlefileupload = this.handlefileupload.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.toggle = this.toggle.bind(this);
    }

    handlefileupload(e){
        if(e.target.value){
            this.setState({ 
                filename: (e.target.value.split( '\\' ).pop()) ? e.target.value.split( '\\' ).pop() : "Upload...",
                filesize: this.fileInput.files[0].size,

                modal: true
            });
        }
    }

    handleSubmit(e){
        e.preventDefault();
        var file = this.fileInput.files[0];

        this.setState({ showLoader: true });

        if(file){
            var formdata = new FormData();
            formdata.append('file', file);

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
        
                    this.setState({ modal: false, filename: "Upload file...", showLoader: false });
            }).catch(error => {
                this.props.addMessaggio({id: uuidv1(), who: "bot", what: "markdown error", messaggio: response.data.message, output: response.data.outputs, code: response.data.code});
            });
        }else{
            this.setState({ modal: false, filename: "Upload file..." });
        }
    }

    toggle() {
        this.setState({
          modal: !this.state.modal,
          filesize: '',
          progress: 0
        });
    }

    render(){
        return (
            <div>
                <Button color="primary" className="upload_button" onClick={this.toggle}><i className="material-icons">attach_file</i> Upload</Button>
                    <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                    <form action="/" method="POST" encType="multipart/form-data" className="form-upload" onSubmit={this.handleSubmit}>
                        <ModalHeader>Upload a file </ModalHeader>   
                        <ModalBody>
                                <input type="file" name="file" id="file" accept=".xls,.xlsx,.csv,.data" className="hidden_input" onChange={this.handlefileupload} ref={input => { this.fileInput = input; }} />
                                <label className="upload-file" htmlFor="file">
                                    <span className="file-name">{this.state.filename}</span><span className="file-size">{(this.state.filesize) ? this.state.filesize / 1000 + "KB" : ""}</span>
                                </label>   
                                {
                                    (this.state.showLoader) ? <img className="loader" src="dist/img/load.gif"/> : ""
                                }
                        </ModalBody>
                        <ModalFooter>
                            <Button color="secondary" onClick={this.toggle}>Cancel</Button>
                            <Button color="primary">Upload <i className="material-icons">cloud_upload</i></Button>{' '}
                        </ModalFooter>
                        </form>
                    </Modal>
            </div>
        );
    }
}

const Upload = connect(null, mapAddVariabileEvent)(ConnectedUpload);
export default Upload;