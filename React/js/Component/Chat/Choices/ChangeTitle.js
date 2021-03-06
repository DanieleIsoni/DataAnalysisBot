import React from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { sendMessage } from '../../../Actions/Axios';

class ChangeTitle extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            modal: false,
            showLoader: false,
            titleinput: this.props.title
        }

        this.handleSubmit = this.handleSubmit.bind(this);
        this.toggle = this.toggle.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }


    handleSubmit(e){
        e.preventDefault();
        let message = "Change " + this.props.title + " title to " + this.fileInput.value;
        sendMessage(message, "NL").then(() => {
            this.toggle();
        })
    }

    handleFormSubmit (e) {
        e.preventDefault();

        this.handleSubmit(e);
    }

    handleChange(e){
        this.setState({ titleinput: e.target.value });
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
                                <form className="form_title" onSubmit={(e) => this.handleFormSubmit(e)}>
                                    <input id="title" type="text" name="titolo" className="input_ask" value={this.state.titleinput} ref={input => { this.fileInput = input; }} onChange={(e) => this.handleChange(e)} required/>
                                </form>
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