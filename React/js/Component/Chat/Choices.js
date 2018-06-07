import React from "react";
import axios from 'axios';
import uuidv1 from "uuid";
import { connect } from "react-redux";
import { addMessaggio, editMessaggio } from "../../Actions/index";
import { ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
var fileDownload = require('js-file-download');

const mapAddMessaggioEvent = dispatch => {
    return {
      addMessaggio: messaggio => dispatch(addMessaggio(messaggio)),
      editMessaggio: (id, messaggio) => dispatch(editMessaggio(id, messaggio)),
    };
};

class ConChoices extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            dropdownFont: false,
            dropdownColor: false,
            inputValue: '',
            asse: 'x-axis'
        }

        this.toggleFont = this.toggleFont.bind(this);
        this.toggleColor = this.toggleColor.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.setFontLabel = this.setFontLabel.bind(this);
        this.setColorLabel = this.setColorLabel.bind(this);
        this.changeAxis = this.changeAxis.bind(this);
        this.sendMex = this.sendMex.bind(this);
    }

    downloadPlot(e){
        var img = "data:image/png;base64," + this.props.image;
        var data = img.replace(/^data:image\/\w+;base64,/, "");
        var buf = new Buffer(data, 'base64');
        fileDownload(buf, "plot.png");
    }

    toggleFont() {
        this.setState({ dropdownFont: !this.state.dropdownFont });
    }

    toggleColor() {
        this.setState({ dropdownColor: !this.state.dropdownColor });
    }

    sendMex(mex){
        var udelete = uuidv1();
        this.props.addMessaggio({id: udelete, who: "bot", what: "markdown", messaggio: <div className="loading"></div>, output: []});
        
        axios({
            url: this.props.url + "/clientWebHook/",
            method: 'post', 
            validateStatus: function (status) {
                return status < 500;
            },
            data: {"message": {
                "text": mex
                },"react": "true"
            }, headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if(response.status == 200){
                this.props.editMessaggio(udelete,{id: uuidv1(), who: "bot", what: "markdown", messaggio: response.data.message, output: response.data.outputs, code: response.data.code});
            }else{
                this.props.editMessaggio(udelete,{id: uuidv1(), who: "bot", what: "markdown error", messaggio: response.data.message, output: response.data.outputs, code: response.data.code});
            }
        })
    }

    setFontLabel(e, font){
        let messaggio = "Change the " + this.state.asse + " label font to " + font;
        this.props.addMessaggio({id: uuidv1(), who: "me", what: "markdown", messaggio: messaggio, output: []});

        this.sendMex(messaggio);
    }

    setColorLabel(e, color){
        let messaggio = "Change the " + this.state.asse + " label color to " + color;
        this.props.addMessaggio({id: uuidv1(), who: "me", what: "markdown", messaggio: messaggio, output: []});

        this.sendMex(messaggio);
    }

    handleKeyPress(e){
        if(e.key == 'Enter'){
            let value = e.target.value;
            this.setState({ inputValue: ''});
            this.setColorLabel(null, value);
        }
    }

    handleChange(evt){
        this.setState({ inputValue: evt.target.value });
    }
    
    changeAxis(e){
        let id = e.target.id;
        let asse = '';
        switch(id){
            case 'x':
                asse = 'x-axis';
                break;
            case 'y':
                asse = 'y-axis';
                break;
            default: 
                asse = 'x-axis';
        }

        this.setState({ asse: asse });
    }

    render(){
        return (
            <div className="choices">
                <div className="download" onClick={(e) => this.downloadPlot(e)}>Download <i className="material-icons">bar_chart</i></div>
                <div className="next"><i className="material-icons">keyboard_arrow_right</i></div> 
                <ButtonDropdown direction="up" className="menu_font" isOpen={this.state.dropdownColor} toggle={this.toggleColor}>
                    <DropdownToggle caret className="toggle_per">
                    Label Color
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem header>Label color selection</DropdownItem>
                        <DropdownItem divider></DropdownItem>
                        <DropdownItem header>Select axis</DropdownItem>
                            <div className="select_axis" onClick={(e) => this.changeAxis(e)}>
                                <div id="x" className={(this.state.asse == "x-axis") ? "axes active" : "axes"}>x</div>
                                <div id="y" className={(this.state.asse == "y-axis") ? "axes active" : "axes"}>y</div>
                            </div>
                        <DropdownItem divider></DropdownItem>
                        <input type="text" className="form-control input_color" placeholder="Enter color..." onKeyPress={this.handleKeyPress} onChange={this.handleChange}/>
                        <DropdownItem onClick={(e) => this.setColorLabel(e, "red")}>Red</DropdownItem>
                        <DropdownItem onClick={(e) => this.setColorLabel(e, "green")}>Green</DropdownItem>
                        <DropdownItem onClick={(e) => this.setColorLabel(e, "blue")}>Blue</DropdownItem>
                    </DropdownMenu>
                </ButtonDropdown>
                <ButtonDropdown  direction="up" className="menu_font" isOpen={this.state.dropdownFont} toggle={this.toggleFont}>
                    <DropdownToggle caret className="toggle_per">
                    Label Font
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem header>Font family selection</DropdownItem>
                        <DropdownItem divider></DropdownItem>
                        <DropdownItem header>Select axis</DropdownItem>
                            <div className="select_axis" onClick={(e) => this.changeAxis(e)}>
                                <div id="x" className={(this.state.asse == "x-axis") ? "axes active" : "axes"}>x</div>
                                <div id="y" className={(this.state.asse == "y-axis") ? "axes active" : "axes"}>y</div>
                            </div>                                                               
                        <DropdownItem divider></DropdownItem>
                        <DropdownItem onClick={(e) => this.setFontLabel(e, "monospace")}>monospace</DropdownItem>
                        <DropdownItem onClick={(e) => this.setFontLabel(e, "serif")}>serif</DropdownItem>
                        <DropdownItem onClick={(e) => this.setFontLabel(e, "sans")}>sans</DropdownItem>
                    </DropdownMenu>
                </ButtonDropdown>
            </div>
        );
    }
}

const Choices = connect(null, mapAddMessaggioEvent)(ConChoices);
export default Choices;