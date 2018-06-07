import React from "react";
import axios from 'axios';
import { connect } from "react-redux";
import { addVariabile, addMessaggio, clearMessaggi, editMessaggio, addHints, setActiveVariable } from "../../Actions/index";
import uuidv1 from "uuid";
import Upload from "./Upload";
import Jupyter from './JupyterOP';
import UndoRedo from './UndoRedo';
import Action from '../../Constants/Actions';
import { Translate } from 'react-localize-redux';
import controlTranslation from './translation';
import { withLocalize } from 'react-localize-redux';
import { renderToString } from 'react-dom/server';

import './control.css';

const mapAddMessaggioEvent = dispatch => {
    return {
      addMessaggio: messaggio => dispatch(addMessaggio(messaggio)),
      editMessaggio: (id, messaggio) => dispatch(editMessaggio(id, messaggio)),
      addVariabile: variabile => dispatch(addVariabile(variabile)),
      clearMessaggi: () => dispatch(clearMessaggi()),
      addHints: hints => dispatch(addHints(hints)),
      setActiveVariable: vari => dispatch(setActiveVariable(vari))
    };
};

const mapVariabili = state => {
    return { variabili: state.variabili.present,
        activeVar: state.active };
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
            waiting_var: false
        }
        this.props.addTranslation(controlTranslation);

        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.clearSession = this.clearSession.bind(this);
    }

    componentDidMount(){
        axios.get(this.props.url + '/messages')
        .then(response => {
            response.data.messages.map(messaggio => {
                this.props.addMessaggio({id: uuidv1(), who: messaggio.who, what: "markdown", messaggio: messaggio.message, output: messaggio.outputs, code: messaggio.code});
            })
            response.data.variables.map((variabile, n) => {
                this.props.addVariabile({ "name": variabile.name, "id": uuidv1() }); 
                if(n == response.data.variables.length-1){
                    this.props.setActiveVariable(variabile.name);
                    console.log("Variabile: " + variabile.name);
                }
            })
            this.actionController("initial");
        }); 
    }

    componentDidUpdate(){
        if(this.state.waiting_var && this.props.activeVar != null){
            this.sendMessage(this.state.temp_mex);
            this.setState({temp_mex: '', waiting_var: false});
        }
    }

    clearSession(e) {
        axios.get(this.props.url + '/clear')
        .then(response => {
            this.props.clearMessaggi();
        })
    }

    actionController (azione) {
        this.setState({ action: azione });
        console.log(azione);
        switch(azione){
            case "initial":
            case "input.welcome":
            case "input.unknown":
            case "data.description.request":
                if(this.props.variabili.length > 0){
                    this.props.addHints(Action["after_file"]);
                }else{
                    this.props.addHints(Action["initial"]);
                }
                break;
            case "data.received":
                this.props.addHints(Action["after_file"]);
                break;
            case "plot.chart":
                this.props.addHints(Action["after_plot"]);
                break;
            case "test.request":
            case "test.request.fu.attribute":
            case "test.request.fu.test":
                this.props.addHints(Action["after_analisys"]);
                break;
            default:
                this.props.addHints(Action["initial"]);
                break;
        }
    }

    sendMessage(value){     
        var comands = this.state.comandi;
        comands.push(value);
        this.setState({ inputValue: '', comandi: comands });

        if(value != ""){
            if(this.state.type != "Py")
                this.props.addMessaggio({id: uuidv1(), who: "me", what: "markdown", messaggio: value, output: []});
            else
                this.props.addMessaggio({id: uuidv1(), who: "me", what: "code", messaggio: value, output: []});
        }

        if(this.props.activeVar == null && this.props.variabili.length > 0){
            this.setState({temp_mex: value, waiting_var: true});
            this.props.addMessaggio({id: uuidv1(), who: "bot", what: "markdown", messaggio: "Specify a variable! Select it...", output: []});
        }else{
            var udelete = uuidv1();
            this.props.addMessaggio({id: udelete, who: "bot", what: "markdown", messaggio: <div className="loading"></div>, output: []});
        
            axios({
                url: this.props.url + "/clientWebHook/",
                method: 'post', 
                validateStatus: function (status) {
                    return status < 500;
                },
                data: {
                        "message": {
                        "text": value
                        },
                    "react": "true",
                    "variabile": (this.props.activeVar == null || typeof this.props.activeVar == 'undefined') ? "empty" : this.props.activeVar
                    //"python": (this.state.type == "Py") ? "true" : "false"
                }, headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if(response.status == 200){
                    this.actionController(response.data.action);
                    this.props.editMessaggio(udelete,{id: uuidv1(), who: "bot", what: "markdown", messaggio: response.data.message, output: response.data.outputs, code: response.data.code});
                }else{
                    this.props.editMessaggio(udelete,{id: uuidv1(), who: "bot", what: "markdown error", messaggio: response.data.message, output: response.data.outputs, code: response.data.code});
                }
            })
        }
    }

    handleKeyPress(event) {
        if(event.key == 'Enter'){
            var value = event.target.value;
            this.sendMessage(value);
        }
    }

    handleKeyDown(e){
        if (e.keyCode === 38) {
            e.preventDefault();
            if(this.state.comandi.length > 0 && this.state.selectedCommand < this.state.comandi.length){
                this.setState({ inputValue: this.state.comandi[this.state.comandi.length - 1 - this.state.selectedCommand], selectedCommand: this.state.selectedCommand + 1 })
            }
        }else if(e.keyCode === 40){
            e.preventDefault();
            if(this.state.selectedCommand > 0){
                var nextSel = this.state.selectedCommand - 1;
                this.setState({ inputValue: this.state.comandi[this.state.comandi.length - 1 - nextSel], selectedCommand: nextSel })
            }else if(this.state.selectedCommand == 0){
                this.setState({inputValue: ""});
            }
        }
    }

    handleChange(evt){
        var text = evt.target.value;
        var python = this.checkPython(text);
        if(python){
            this.setState({type: "Py"});
        }else{
            this.setState({type: "NL"});
        }
        this.setState({ inputValue: evt.target.value });
    }

    checkPython(text){
        var pattern =/([\/\+\-\*\[\]\(\)\:]|import|if|case|.*\..*)+/;
        return pattern.test(text);  // returns a boolean 
    }

    render(){
        return (
            <div className="control">
                <UndoRedo />
                <div className="input_container">
                    <input type="text" name="input" id="dialog" autoComplete="off" placeholder={(this.state.inputValue.length == 0) ? renderToString(<Translate id="sugg"></Translate>) : ""} value={this.state.inputValue} onKeyDown={ this.handleKeyDown } onKeyPress={this.handleKeyPress} onChange={this.handleChange}/>
                    <span className={(this.state.type == "NL" ? "type_of" : "type_of type_py")}>{this.state.type}</span>
                    {
                        (this.props.activeVar != null) ?
                        <span className="var_sel">{this.props.activeVar}</span>
                        :
                        ''
                    }
                </div>
                <Upload addMessaggio={this.props.addMessaggio} url={this.props.url} theme={"form_add"} text={<i className="material-icons">attach_file</i>}/>
                <Jupyter />
                <button className="button-board-lateral" onClick={this.clearSession}><i className="material-icons">clear_all</i> <Translate id="clear"></Translate></button>
            </div>
        );
    }
}

const Form = connect(mapVariabili, mapAddMessaggioEvent)(ConnectedForm);
export default withLocalize(Form);