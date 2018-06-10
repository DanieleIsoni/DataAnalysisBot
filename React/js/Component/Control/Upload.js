import React from "react";
import axios from 'axios';
import { connect } from "react-redux";
import { addVariabile, addMessaggio, addHints, setActiveVariable} from "../../Actions/index";
import uuidv1 from "uuid";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { uploadFile } from '../../Actions/Axios'

var MODAL_REF = 'MODAL';

const mapEvents = dispatch => {
    return {
      addVariabile: variabile => dispatch(addVariabile(variabile)),
      addHints: hints => dispatch(addHints(hints)),
      setActiveVariable: vari => dispatch(setActiveVariable(vari))
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
        this.sendFile.focus();
    }

    handleSubmit(e){
        e.preventDefault();
        var file = this.fileInput.files[0];
        this.setState({ showLoader: true });

        if(file){
            var send_active = (this.props.activeVar == null || typeof this.props.activeVar == 'undefined') ? "empty" : this.props.activeVar;
            uploadFile(file, send_active).then(() => {
                this.setState({ modal: false, filename: "Upload file...", showLoader: false });
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
            <div style={(this.props.theme == "form_add") ? {} : {display: 'inline-block'}}>
                <Button className={(this.props.theme == "form_add") ? "button-board round" : "attach_side"} onClick={this.toggle}>{this.props.text}</Button>
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
                                <Button innerRef={(button) => (this.sendFile = button)} color="primary">Upload <i className="material-icons">cloud_upload</i></Button>{' '}
                            </ModalFooter>
                        </form>
                    </Modal>
            </div>
        );
    }
}

const Upload = connect(null, mapEvents)(ConnectedUpload);
export default Upload;