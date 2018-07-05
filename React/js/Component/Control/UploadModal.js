import React from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { uploadFile } from '../../Actions/Axios'

class AskModal extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            filename: 'Seleziona il file...',
            filesize: '',
            modal: false,
            progress: 0,
            showLoader: false,
            fileDropped: null,
            separator: ','
        }

        this.handlefileupload = this.handlefileupload.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSeparator = this.handleSeparator.bind(this);
    }
    
    handlefileupload(e){
        if(e.target.value){
            if(this.fileInput.files[0].type == "application/vnd.ms-excel"){
                this.setState({ uploadingCSV: true });
            }else{
                this.setState({ uploadingCSV: false });
            }

            this.setState({ 
                filename: (e.target.value.split( '\\' ).pop()) ? e.target.value.split( '\\' ).pop() : "Upload...",
                filesize: this.fileInput.files[0].size
            });
        }        

        this.sendFile.focus();
    }

    handleSubmit(e){
        e.preventDefault();
        var file = null;

        if(this.props.file && this.props.file != null){
            file = this.props.file;
        }else{
            file = this.fileInput.files[0];
        }
        
        if(file){
            this.setState({ showLoader: true });
            var send_active = (this.props.activeVar == null || typeof this.props.activeVar == 'undefined') ? "empty" : this.props.activeVar;
            uploadFile(file, send_active, this.state.separator).then(() => {
                this.setState({filename: "Upload file...", showLoader: false });
                this.props.toggle();
            }).catch(error => {
                console.log(error);
            });
        }else{
            this.setState({filename: "Upload file..." });
            this.props.toggle();
        }
    }

    handleSeparator (e){
        this.setState({
            separator: e.target.value
        });
    }

    render(){
        var droporup = (this.props.file && this.props.file != null) 
            ? 
                <div>
                    <span className="body_text">Dropped file</span>
                    <h6 className="body_text file_dropped">{this.props.file.name}</h6>
                    {
                        (this.props.file.type == "application/vnd.ms-excel") ? 
                            <span className="body_text" style={{marginTop: '20px'}}>Select the separator symbol
                                <input type="text" maxLength="1" name="separator" className="input_ask" placeholder="Default ','" onChange={(e) => handleSeparator(e)}/>
                            </span>
                        :
                        ''
                    }
                </div>
            :
                <div>
                    <span className="body_text">Select a dataset file in .data/.csv format to start calculation</span>
                    <input type="file" name="file" id="file" accept=".xls,.xlsx,.csv,.data" className="hidden_input" value={this.props.file} onChange={this.handlefileupload} ref={input => { this.fileInput = input; }} />
                    <label className="upload-file" htmlFor="file">
                        <span className="file-name">{this.state.filename}</span><span className="file-size">{(this.state.filesize) ? this.state.filesize / 1000 + "KB" : ""}</span>
                    </label>
                </div>

        return (
            <Modal isOpen={this.props.modal} toggle={this.props.toggle} className="upload_modal">
            <form action="/" method="POST" encType="multipart/form-data" className="form-upload" onSubmit={this.handleSubmit}>
                <ModalHeader>Upload a file </ModalHeader>   
                <ModalBody>
                    {droporup}
                    {
                        (this.state.uploadingCSV) ? 
                            <span className="body_text" style={{marginTop: '20px'}}>Select the separator symbol
                                <input type="text" maxLength="1" name="separator" className="input_ask" placeholder="Default ','" onChange={(e) => handleSeparator(e)}/>
                            </span>
                            :
                            ''
                    }
                </ModalBody>
                <ModalFooter>
                    <Button className="cancel" onClick={this.props.toggle}>Cancel</Button>
                    <Button innerRef={(button) => (this.sendFile = button)} color="primary">Upload</Button>{' '}
                    { (this.state.showLoader) ? <div className="lds-ellipsis loader-black"><div></div><div></div><div></div><div></div></div> : ""}
                </ModalFooter>
            </form>
        </Modal>
        );
    }
}

export default AskModal;