import React from "react";
import axios from 'axios';
import { connect } from "react-redux";
import { addVariabile, addMessaggio, clearMessaggi } from "../Actions/index";
import uuidv1 from "uuid";
import Upload from "./Upload";
import SaveJupyter from './SaveJupyter';
import LoadJupyter from './LoadJupyter';
import UndoRedo from './UndoRedo';

const mapAddMessaggioEvent = dispatch => {
    return {
      addMessaggio: messaggio => dispatch(addMessaggio(messaggio)),
      addVariabile: variabile => dispatch(addVariabile(variabile)),
      clearMessaggi: () => dispatch(clearMessaggi())
    };
};

class ConnectedForm extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            inputValue: '',
            comandi: [""],
            selectedCommand: 0
        }

        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.clearSession = this.clearSession.bind(this);
    }

    componentDidMount(){
        axios.get('https://data-analysis-bot.herokuapp.com/messages')
        .then(response => {
            console.log(response);

            response.data.messages.map(messaggio => {
                this.props.addMessaggio({id: uuidv1(), who: messaggio.who, what: "markdown", messaggio: messaggio.message, output: messaggio.outputs, code: messaggio.code});
            })

            response.data.variables.map(variabile => {
                this.props.addVariabile({ "name": variabile.name, "id": uuidv1() }); 
            })
        })
    }

    clearSession(e) {
        axios.get('https://data-analysis-bot.herokuapp.com/clear')
        .then(response => {
            this.props.clearMessaggi();
        })
    }

    sendMessage(event){
        var value = event.target.value;
            
        var comands = this.state.comandi;
        comands.push(value);

        this.props.addMessaggio({id: uuidv1(), who: "me", what: "markdown", messaggio: value, output: []});
        this.setState({ inputValue: '', comandi: comands});

        axios.post("https://data-analysis-bot.herokuapp.com/clientWebHook/", {
            "message": {
                "text": value
            },
            "react": "true"
        }, {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        })
        .then(response => {
            this.props.addMessaggio({id: uuidv1(), who: "bot", what: "markdown", messaggio: response.data.message, output: response.data.outputs, code: response.data.code});
            console.log(response.data.output);
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
                this.setState({ inputValue: this.state.comandi[this.state.selectedCommand], selectedCommand: this.state.selectedCommand + 1 })
            }
        }else if(e.keyCode === 40){
            e.preventDefault();
            if(this.state.selectedCommand > 0){
                var nextSel = this.state.selectedCommand - 1;
                this.setState({ inputValue: this.state.comandi[nextSel], selectedCommand: nextSel })
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
                <input type="text" name="input" id="dialog" autoComplete="off" placeholder="Ask me something!" value={this.state.inputValue} onKeyDown={ this.handleKeyDown } onKeyPress={this.handleKeyPress} onChange={this.handleChange}/>
                <div className="suggest_panel col-12 col-md-8 col-lg-8"></div>
                <Upload addMessaggio={this.props.addMessaggio}/>
                <SaveJupyter />
                <LoadJupyter />
                <button className="button-board-lateral" onClick={this.clearSession}>Clear</button>
            </div>
        );
    }
}

const Form = connect(null, mapAddMessaggioEvent)(ConnectedForm);
export default Form;