import React from "react";
import axios from 'axios';
import uuidv1 from "uuid";
import { connect } from "react-redux";
import { addMessaggio, editMessaggio } from "../../../Actions/index";
import { ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import Download from './Download';
import {sendMessage} from './../../../Actions/Axios'

const mapMessageEvent = dispatch => {
    return {
      addMessaggio: messaggio => dispatch(addMessaggio(messaggio)),
      editMessaggio: (id, messaggio) => dispatch(editMessaggio(id, messaggio)),
    };
};

const mapState = state => {
    return { activeVar: state.active };
};

class ConChoices extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            dropdownFont: false,
            dropdownColor: false,
            inputValue: '',
            axis: 'x-axis'
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

    toggleFont() { this.setState({ dropdownFont: !this.state.dropdownFont }); }
    toggleColor() { this.setState({ dropdownColor: !this.state.dropdownColor }); }

    sendMex(mex){
        sendMessage(mex, "NL", this.props.activeVar, false);
    }

    setFontLabel(e, font){
        let messaggio = "Change the " + this.state.axis + " label font to " + font;
        this.props.addMessaggio({id: uuidv1(), who: "me", what: "markdown", messaggio: messaggio, output: []});
        this.sendMex(messaggio);
    }

    setColorLabel(e, color){
        let messaggio = "Change the " + this.state.axis + " label color to " + color;
        this.props.addMessaggio({id: uuidv1(), who: "me", what: "markdown", messaggio: messaggio, output: []});
        this.sendMex(messaggio);
    }

    handleKeyPress(e){
        if(e.key == 'Enter'){
            this.setState({ inputValue: ''});
            this.setColorLabel(null, e.target.value);
        }
    }

    handleChange(evt){
        this.setState({ inputValue: evt.target.value });
    }
    
    changeAxis(e){
        let axis = '';
        switch(e.target.id){
            case 'x':
                axis = 'x-axis';
                break;
            case 'y':
                axis = 'y-axis';
                break;
            default: 
                axis = 'x-axis';
        }

        this.setState({ axis: axis });
    }

    render(){
        const select_axis = <div className="select_axis" onClick={(e) => this.changeAxis(e)}>
                                <div id="x" className={(this.state.axis == "x-axis") ? "axes active" : "axes"}>x</div>
                                <div id="y" className={(this.state.axis == "y-axis") ? "axes active" : "axes"}>y</div>
                            </div>;

        return (
            <div className="choices">
                <Download content={this.props.image}/>
                <ButtonDropdown direction="up" className="menu_font" isOpen={this.state.dropdownColor} toggle={this.toggleColor}>
                    <DropdownToggle caret className="toggle_per">
                    Label Color
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem header>Label color selection</DropdownItem>
                        <DropdownItem divider></DropdownItem>
                        <DropdownItem header>Select axis</DropdownItem>
                        {select_axis}   
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
                        {select_axis}                                                              
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

const Choices = connect(mapState, mapMessageEvent)(ConChoices);
export default Choices;