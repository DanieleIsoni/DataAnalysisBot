import React from "react";
import { connect } from "react-redux";
import uuidv1 from "uuid";
import Upload from "./Upload";
import Jupyter from './JupyterOperation';
import UndoRedo from './UndoRedo';
import { Translate } from 'react-localize-redux';
import controlTranslation from './translation';
import { withLocalize } from 'react-localize-redux';
import { renderToString } from 'react-dom/server';
import Code from '../Chat/Code';
import {sendMessage, clearMessages, getAll} from '../../Actions/Axios'
import './control.css';

const mapEvents = dispatch => {
    return { addHints: hints => dispatch(addHints(hints)) };
};

const mapState = state => {
    return { variabili: state.variabili.present, activeVar: state.active };
};

class ConnectedForm extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            inputValue: '',
            comandi: [],
            selectedCommand: 0,
            type: 'NL',
            temp_mex: '',
            waiting_var: false,
            focused: false
        }
        this.props.addTranslation(controlTranslation);

        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
    }

    componentDidMount(){ getAll(); }

    componentDidUpdate(){
        if(this.state.type == "Py") this.updateTextArea();
        
        if(this.state.waiting_var && this.props.activeVar != null){
            this.sendMessage(this.state.temp_mex);
            this.setState({temp_mex: '', waiting_var: false});
        }
    }

    sendMessage(value){     
        var comands = this.state.comandi;
        comands.push(value);
        this.setState({ inputValue: '', comandi: comands });

        if(this.props.activeVar == null && this.props.variabili.length > 0){
            this.setState({temp_mex: value, waiting_var: true});
        }

        sendMessage(value, this.state.type, this.props.activeVar, !this.state.waiting_var, this.props.activeVar);
    }

    handleKeyPress(event) {
        if(event.key == 'Enter'){
            if(!event.shiftKey){
                var value = event.target.value;
                event.preventDefault();
                this.sendMessage(value);
            }
        }
    }

    handleChange(evt){
        var text = evt.target.value;
        this.setState({ inputValue: evt.target.value });

        this.textarea.style.height = '30px';
        this.textarea.style.height = this.textarea.scrollHeight + 'px';

        var python = this.checkPython(text);
        if(python){
            this.setState({type: "Py"});
            this.updateTextArea();
        }else{
            this.setState({type: "NL"});
        }
    }

    updateTextArea(){
        this.preview.style.bottom = '40px';
        this.preview.style.bottom = this.control.clientHeight-1 + 'px';
    }

    handleFocus(e, focus){
        this.setState({ focused: focus });
    }

    checkPython(text){
        var pattern =/([\/\+\-\*\[\]\(\)\:]|import|if|case|.*\..*)+/;
        return pattern.test(text);
    }

    render(){
        const editor_code = 
            <div className="preview_py" style={{display: (this.state.type == "Py") ? "block" : "none" }} ref={div => this.preview = div}>
                <Code code={this.state.inputValue} theme="dark" line="false"/>
            </div>;

        return (
            <div className="control" ref={div => this.control = div}>      
                {editor_code}
                <UndoRedo />
                <div className={(this.state.focused) ? "input_container input_cont_focused" : "input_container"}>
                    <textarea rows="1" id="dialog" autoComplete="on" onBlur={(e) => this.handleFocus(e, false)} onFocus={(e) => this.handleFocus(e, true)} ref={input => this.textarea = input} placeholder={(this.state.inputValue.length == 0) ? renderToString(<Translate id="sugg"></Translate>) : ""} value={this.state.inputValue} onKeyPress={this.handleKeyPress} onChange={this.handleChange}></textarea>                  
                        <span className={(this.state.type == "NL" ? "type_of" : "type_of type_py")}>{this.state.type}</span>
                        {
                            (this.props.activeVar != null) ? <span className="var_sel">{this.props.activeVar}</span> : ''
                        }
                </div>
                {/*<Upload addMessaggio={this.props.addMessaggio} url={this.props.url} theme={"form_add"} text={<i className="material-icons">attach_file</i>}/>*/}
                <Jupyter />
                <button className="button-board-lateral" onClick={(e) => clearMessages(e)}><i className="material-icons" style={{color: "#EF5350"}}>clear_all</i> <Translate id="clear"></Translate></button>
            </div>
        );
    }
}

const Form = connect(mapState, mapEvents)(ConnectedForm);
export default withLocalize(Form);