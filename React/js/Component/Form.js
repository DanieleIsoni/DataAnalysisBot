import React from "react";
import axios from 'axios';
import { connect } from "react-redux";
import { addMessaggio } from "../Actions/index";
import uuidv1 from "uuid";
import Upload from "./Upload";

var chatId = uuidv1();

const mapAddMessaggioEvent = dispatch => {
    return {
      addMessaggio: messaggio => dispatch(addMessaggio(messaggio))
    };
};

class ConnectedForm extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            inputValue: ''
        }

        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount(){
        axios.get('https://data-analysis-bot.herokuapp.com/messages')
        .then(response => {
            response.data.messages.map(messaggio => {
                this.props.addMessaggio({id: uuidv1(), who: messaggio.who, what: 'markdown', messaggio: messaggio.message, output: messaggio.outputs, code: messaggio.code});
            })
        })
    }

    handleKeyPress(event) {
        if(event.key === 'Enter'){
            var value = event.target.value;
            
            this.props.addMessaggio({id: uuidv1(), who: "me", what: "markdown", messaggio: value, output: []});
            this.setState({ inputValue: ''});

            axios.post("https://data-analysis-bot.herokuapp.com/clientWebHook/", {
                "message": {
                    "chat": {"id": chatId}, 
                    "text": value
                },
                "react": "true"
            }, {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            })
            .then(response => {
                this.props.addMessaggio({id: uuidv1(), who: response.data.who, what: "markdown", messaggio: response.data.message, output: response.data.outputs, code: response.data.code});
            })
        }
    }

    handleChange(evt){
        this.setState({ inputValue: evt.target.value });
    }

    render(){
        return (
            <div className="control">
                <button className="button-board round"><i className="material-icons">undo</i></button>
                <button className="button-board round"><i className="material-icons">redo</i></button>
                <input type="text" name="input" id="dialog" autoComplete="off" placeholder="Ask me something!" value={this.state.inputValue} onKeyPress={this.handleKeyPress} onChange={this.handleChange}/>
                <Upload addMessaggio={this.props.addMessaggio} chatID={chatId}/>
            </div>
        );
    }
}

const Form = connect(null, mapAddMessaggioEvent)(ConnectedForm);
export default Form;