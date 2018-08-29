import React from "react";
import { connect } from "react-redux";
import { addDataset, addHints, setActiveDataset} from "../../Actions/index";
import { Button } from 'reactstrap';
import UploadModal from "./UploadModal";

const mapEvents = dispatch => {
    return {
      addDataset: dataset => dispatch(addDataset(dataset)),
      addHints: hints => dispatch(addHints(hints)),
      setActiveDataset: dataset => dispatch(setActiveDataset(dataset))
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

        this.toggle = this.toggle.bind(this);
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
            <div id={this.props.id} style={(this.props.theme == "form_add") ? {} : {display: 'inline-block', padding: '0px'}}>
                <Button className={(this.props.theme == "form_add") ? "button-board round" : "attach_side"} onClick={this.toggle} id="upload">{this.props.text}</Button>
                <UploadModal toggle={this.toggle} modal={this.state.modal}/>
            </div>
        );
    }
}

const Upload = connect(null, mapEvents)(ConnectedUpload);
export default Upload;