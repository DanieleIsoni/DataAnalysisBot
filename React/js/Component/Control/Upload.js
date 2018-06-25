import React from "react";
import { connect } from "react-redux";
import { addVariable, addHints, setActiveVariable} from "../../Actions/index";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { uploadFile } from '../../Actions/Axios'

const mapEvents = dispatch => {
    return {
      addVariabile: variabile => dispatch(addVariable(variabile)),
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
        
        if(file){
            this.setState({ showLoader: true });
            var send_active = (this.props.activeVar == null || typeof this.props.activeVar == 'undefined') ? "empty" : this.props.activeVar;
            uploadFile(file, send_active).then(() => {
                this.setState({ modal: false, filename: "Upload file...", showLoader: false });
            }).catch(error => {
                console.log(error);
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
            <div id={this.props.id} style={(this.props.theme == "form_add") ? {} : {display: 'inline-block'}}>
                <Button className={(this.props.theme == "form_add") ? "button-board round" : "attach_side"} onClick={this.toggle}>{this.props.text}</Button>
                    <Modal isOpen={this.state.modal} toggle={this.toggle} className="upload_modal">
                        <form action="/" method="POST" encType="multipart/form-data" className="form-upload" onSubmit={this.handleSubmit}>
                            <ModalHeader>Upload a file </ModalHeader>   
                            <ModalBody>
                                    <span className="body_text">Select a dataset file in .data/.csv format to start calculation</span>
                                    <input type="file" name="file" id="file" accept=".xls,.xlsx,.csv,.data" className="hidden_input" onChange={this.handlefileupload} ref={input => { this.fileInput = input; }} />
                                    <label className="upload-file" htmlFor="file">
                                        <span className="file-name">{this.state.filename}</span><span className="file-size">{(this.state.filesize) ? this.state.filesize / 1000 + "KB" : ""}</span>
                                    </label>   
                            </ModalBody>
                            <ModalFooter>
                                <Button className="cancel" onClick={this.toggle}>Cancel</Button>
                                <Button innerRef={(button) => (this.sendFile = button)} color="primary">Upload</Button>{' '}
                                { (this.state.showLoader) ? <div className="lds-ellipsis loader-black"><div></div><div></div><div></div><div></div></div> : ""}
                            </ModalFooter>
                        </form>
                    </Modal>
            </div>
        );
    }
}

const Upload = connect(null, mapEvents)(ConnectedUpload);
export default Upload;