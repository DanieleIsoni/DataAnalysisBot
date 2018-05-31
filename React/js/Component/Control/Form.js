import React from "react";
import axios from 'axios';
import { connect } from "react-redux";
import { addVariabile, addMessaggio, clearMessaggi, editMessaggio, addHints } from "../../Actions/index";
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
      addHints: hints => dispatch(addHints(hints))
    };
};

const mapVariabili = state => {
    return { variabili: state.variabili.present };
};

class ConnectedForm extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            inputValue: '',
            comandi: [],
            selectedCommand: 0
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
            response.data.variables.map(variabile => {
                this.props.addVariabile({ "name": variabile.name, "id": uuidv1() }); 
            })
            this.actionController("initial");
        }); 
    }

    clearSession(e) {
        axios.get(this.props.url + '/clear')
        .then(response => {
            this.props.clearMessaggi();
        })
    }

    actionController (azione) {
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

    sendMessage(event){
        var value = event.target.value;
            
        var comands = this.state.comandi;
        comands.push(value);
        this.setState({ inputValue: '', comandi: comands});

        if(value != ""){
            this.props.addMessaggio({id: uuidv1(), who: "me", what: "markdown", messaggio: value, output: []});
        }

        var udelete = uuidv1();
        this.props.addMessaggio({id: udelete, who: "bot", what: "markdown", messaggio: <div className="loading"></div>, output: []});

        axios({
            url: this.props.url + "/clientWebHook/",
            method: 'post', 
            validateStatus: function (status) {
                return status < 500;
            },
            data: {"message": {
                "text": value
                },"react": "true"
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

    handleKeyPress(event) {
        if(event.key == 'Enter'){
            this.sendMessage(event);
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
        this.setState({ inputValue: evt.target.value });
    }

    render(){
        return (
            <div className="control">
                <UndoRedo />
                <input type="text" name="input" id="dialog" autoComplete="off" placeholder={(this.state.inputValue.length == 0) ? renderToString(<Translate id="sugg"></Translate>) : ""} value={this.state.inputValue} onKeyDown={ this.handleKeyDown } onKeyPress={this.handleKeyPress} onChange={this.handleChange}/>
                <Upload addMessaggio={this.props.addMessaggio} url={this.props.url}/>
                <Jupyter />
                <button className="button-board-lateral" onClick={this.clearSession}><Translate id="clear">Clear</Translate></button>
            </div>
        );
    }
}

const Form = connect(mapVariabili, mapAddMessaggioEvent)(ConnectedForm);
export default withLocalize(Form);