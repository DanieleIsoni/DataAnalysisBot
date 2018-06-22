import React from "react";
import { connect } from "react-redux";
import Jupyter from './JupyterOperation';
import UndoRedo from './UndoRedo';
import { Translate } from 'react-localize-redux';
import controlTranslation from './translation';
import { withLocalize } from 'react-localize-redux';
import { renderToString } from 'react-dom/server';
import Code from '../Chat/Code';
import {sendMessage, clearMessages} from '../../Actions/Axios'
import Suggest from './Suggest';
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
            suggest: new Set([]),
            restricted: new Set([]),
            selectedCommand: -1,
            type: 'NL',
            temp_mex: '',
            waiting_var: false,
            focused: false,
            loading: false,
            temp_search: ''
        }
        this.props.addTranslation(controlTranslation);

        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.setInput = this.setInput.bind(this);
    }

    componentWillMount(){
        if (typeof(Storage) !== "undefined") {
            if(localStorage.getItem('suggestion') != null){
                let array = JSON.parse(sessionStorage.getItem('suggestion')) || []; 
                let fromStorage = new Set([...array]);

                if(fromStorage != null){
                    this.setState({
                        suggest: fromStorage
                    });
                }
            }
        }else{
            console.log("Unavaibable");
        }
    }

    componentDidUpdate(){
        if(this.state.type == "Py") this.updateTextArea();
        
        if(this.state.waiting_var && this.props.activeVar != null){
            this.sendMessage(this.state.temp_mex);
            this.setState({temp_mex: '', waiting_var: false});
        }
    }

    sendMessage(value){     
        let suggest = this.state.suggest;
        suggest.add(value);

        this.setRestrictedArray("");
        this.setState({ inputValue: '', suggest: suggest, loading: true });

        if (typeof(Storage) !== "undefined") {
            sessionStorage.setItem('suggestion', JSON.stringify([...this.state.suggest]));
        }

        if(this.props.activeVar == null && this.props.variabili.length > 0){
            this.setState({temp_mex: value, waiting_var: true});
        }

        sendMessage(value, this.state.type, this.props.activeVar, !this.state.waiting_var).then(() => {
            this.setState({ loading: false, selectedCommand: -1 });
        });        
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
        this.setRestrictedArray(text);
        this.setState({ inputValue: evt.target.value, selectedCommand: -1 });

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

    setRestrictedArray(search) {
        let set = this.state.suggest;
        let restricted = new Set([]);

        if(search == ""){
            restricted = set;
        }else{
            set.forEach(function(value) {
                var regex = new RegExp('^' + search + '')
                if(regex.test(value)){
                    restricted.add(value);
                }
            });
        }

        this.setState({
            restricted: restricted
        });
    }

    handleKeyDown(e){
        if(e.keyCode == 9){
            e.preventDefault();
            var start = this.textarea.selectionStart;
            var end = this.textarea.selectionEnd;

            var val = this.textarea.value.substring(0, start) + "\t" + this.textarea.value.substring(end);
            this.selectionStart = this.selectionEnd = start + 1;

            this.setState({ inputValue: val });
        }

        if (e.keyCode === 38) {
            if(this.state.type == "NL"){
                e.preventDefault();
                var select = this.state.selectedCommand + 1;
                if(this.state.restricted.size > 0 && select < this.state.restricted.size){
                    if(select == 0){
                        this.setState({temp_search: this.state.inputValue});
                    }
                    this.setState({inputValue: [...this.state.restricted][this.state.restricted.size - 1 - select], selectedCommand: select, })
                }
            }            
        }else if(e.keyCode === 40){
            if(this.state.type == "NL"){
                e.preventDefault();
                var select = this.state.selectedCommand - 1;
                if(select >= 0){
                    this.setState({ inputValue: [...this.state.restricted][this.state.restricted.size - 1 - select], selectedCommand: select })
                }else if(select == -1){
                    this.setState({inputValue: this.state.temp_search, selectedCommand: select});
                    this.setRestrictedArray(this.state.temp_search);
                }
            }       
        }
    }

    updateTextArea(){
        this.preview.style.bottom = '40px';
        this.preview.style.bottom = this.control.clientHeight-1 + 'px';
    }

    handleFocus(e, focus){
        this.setState({ focused: focus });
        this.setRestrictedArray(this.state.inputValue);
    }

    checkPython(text){
        var pattern =/([\/\+\*\[\]\(\)\:]|import|\bif\b|\bcase\b|\bdef\b|.*\..*)+/;
        return pattern.test(text);
    }

    setInput(e, sug){
        e.preventDefault();
        this.textarea.focus();
        this.setState({ inputValue: sug });
    }

    render(){
        const editor_code = 
            <div className="preview_py" style={{display: (this.state.type == "Py") ? "block" : "none" }} ref={div => this.preview = div}>
                <Code code={this.state.inputValue} theme="dark" line="false"/>
            </div>;

        return (
            <div className="control" ref={div => this.control = div}>      
                {editor_code}
                <Suggest input={this.state.inputValue} handleSuggest={(e, sug) => this.setInput(e, sug)} type={this.state.type} focused={this.state.focused} suggest={this.state.restricted} select={this.state.selectedCommand}/>
                <UndoRedo />
                <div style={{display: (this.state.loading) ? "block" : "none"}} className="lds-ellipsis loader-light"><div></div><div></div><div></div><div></div></div>
                <div className={(this.state.focused) ? "input_container input_cont_focused" : "input_container"}>
                    <textarea onKeyDown={this.handleKeyDown} rows="1" id="dialog" autoComplete="on" onBlur={(e) => this.handleFocus(e, false)} onFocus={(e) => this.handleFocus(e, true)} ref={input => this.textarea = input} placeholder={(this.state.inputValue.length == 0) ? renderToString(<Translate id="sugg"></Translate>) : ""} value={this.state.inputValue} onKeyPress={this.handleKeyPress} onChange={this.handleChange}></textarea>                  
                        <span className={(this.state.type == "NL" ? "type_of" : "type_of type_py")}>{this.state.type}</span>
                        {
                            (this.props.activeVar != null) ? <span className="var_sel var_back">{this.props.activeVar}</span> : <span className="var_sel">No Context</span> 
                        }
                </div>
                {/*<Upload addMessaggio={this.props.addMessaggio} url={this.props.url} theme={"form_add"} text={<i className="material-icons">attach_file</i>}/>*/}
                <div className="group_button">
                    <Jupyter />
                    <button className="button-board-lateral clear" onClick={(e) => clearMessages(e)}><i className="material-icons" style={{color: "#EF5350"}}>clear_all</i> <Translate id="clear"></Translate></button>
                </div>
            </div>
        );
    }
}

const Form = connect(mapState, mapEvents)(ConnectedForm);
export default withLocalize(Form);