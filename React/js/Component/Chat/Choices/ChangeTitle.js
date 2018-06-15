import React from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { sendMessage } from '../../../Actions/Axios';

class ChangeTitle extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            input: '',
            modal: false,
            showLoader: false
        }

        this.handleTitleChange = this.handleTitleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.toggle = this.toggle.bind(this);
    }

    handleTitleChange(e){
        if(e.target.value){
            this.setState({
                input: e.target.value,
                modal: true
            });
        }
    }

    handleSubmit(e){
        e.preventDefault();
        sendMessage(this.state.input, "NL");
    }

    toggle() {
        this.setState({
          modal: !this.state.modal
        });
    }

    render(){
        return (
            <div>
                <Button className="menu_font" onClick={this.toggle}>Change Title</Button>
                    <Modal isOpen={this.state.modal} toggle={this.toggle} className="upload_modal">
                        <ModalHeader>Change plot title</ModalHeader>   
                        <ModalBody>
                                <span className="body_text">Change the title of the plot $NOME on $DATASET</span>
                                <input type="text" name="titolo" className="title_input" value={this.state.input} onChange={this.handleTitleChange} ref={input => { this.fileInput = input; }} />
                        </ModalBody>
                        <ModalFooter>
                            <Button className="cancel" onClick={this.toggle}>Cancel</Button>
                            <Button innerRef={(button) => (this.sendFile = button)} onClick={this.handleSubmit} color="primary">Save</Button>{' '}
                            { (this.state.showLoader) ? <div className="lds-ellipsis loader-black"><div></div><div></div><div></div><div></div></div> : ""}
                        </ModalFooter>
                    </Modal>
            </div>
        );
    }
}

export default ChangeTitle;