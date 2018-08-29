import React from "react";
import { connect } from "react-redux";
var fileDownload = require('js-file-download');
import { addMessage } from "../../Actions/index";
import uuidv1 from "uuid";
import Jup from "../../Jupyter/Jupyter";
import { ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

const mapMessaggi = state => {
    return { messages: state.messages.present };
};

const mapAddMessaggioEvent = dispatch => {
    return {
      addMessage: messaggio => dispatch(addMessage(messaggio))
    };
};

class ConnectedJupyter extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            dropdownOpen: false,
            label: " Load Jupyter"
        }

        this.saveJupyter = this.saveJupyter.bind(this);
        this.toggle = this.toggle.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    generateJSON(){
        var json_jup = new Jup();

        this.props.messages.map(el =>{
            if(el.what != "code"){
                if(el.code != null)
                    json_jup.addCode(el.output, el.code, el.who_code);
                else
                    json_jup.addMarkdown(el.who, el.message);
            }
        });

        return json_jup;
    }

    handleChange(files) {
        var file = files[0];
        this.setState({
            label: file.name.split( '.' )[0]
        });

        var reader = new FileReader();
        reader.readAsText(file);

        reader.onload = (function(f) {
            return function(evt) {
                var json = JSON.parse(evt.target.result);
                var messaggi_jup = Jup.readJupyter(json.cells);

                messaggi_jup.map(mes => {
                    f.addMessage({id: uuidv1(), who: mes.who, what: mes.what, message: mes.message, output: mes.output, code: mes.code});
                });
            };
        })(this.props);
    }

    saveJupyter(e){
        this.setState({ savedJup: 'Saved' });
        var ipynb = this.generateJSON();
        var today = new Date();
        var ora = today.getHours() + '-' + today.getMinutes() + '_';
        var date = today.getDate() + "-" + today.getMonth()+1 + "-" + today.getFullYear();

        fileDownload(JSON.stringify(ipynb,  null, '\t'), ora + date + '.ipynb');
    }

    toggle() {
        this.setState({
          dropdownOpen: !this.state.dropdownOpen
        });
    }

    render(){
        return(
            <ButtonDropdown  className="button-board-lateral" isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                <DropdownToggle caret className="group_lateral">
                <i className="material-icons" style={{color: "#ff9933"}}>compare_arrows</i> Jupyter 
                </DropdownToggle>
                <DropdownMenu>
                <DropdownItem header><img style={{width: '35px'}} src="dist/img/jup.png"/> Jupyter menu </DropdownItem>
                <DropdownItem onClick={this.saveJupyter}><i className="material-icons">cloud_download</i> Save Jupyter</DropdownItem>
                <DropdownItem divider />
                <form action="/" method="POST" encType="multipart/form-data">
                    <input type="file" name="file" id="jup" accept=".ipynb" className="hidden_input" onChange={ (e) => this.handleChange(e.target.files) }/>
                    <label htmlFor="jup" className="dropdown-item"><span><i className="material-icons">cloud_upload</i> {this.state.label}</span></label> 
                </form>
                </DropdownMenu>
            </ButtonDropdown>
        );
    }
}

const Jupyter = connect(mapMessaggi, mapAddMessaggioEvent)(ConnectedJupyter);
export default Jupyter;