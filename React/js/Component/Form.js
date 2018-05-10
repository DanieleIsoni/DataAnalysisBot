import React from "react";
import axios from 'axios';
import { connect } from "react-redux";
import { addVariabile, addMessaggio } from "../Actions/index";
import uuidv1 from "uuid";
import Upload from "./Upload";
import SaveJupyter from './SaveJupyter';
import LoadJupyter from './LoadJupyter';
import { ActionCreators } from 'redux-undo'

const mapAddMessaggioEvent = dispatch => {
    return {
      addMessaggio: messaggio => dispatch(addMessaggio(messaggio)),
      addVariabile: variabile => dispatch(addVariabile(variabile))
    };
};

const mapStateToProps = (state) => ({
    canUndo: state.messaggi.past.length > 0,
    canRedo: state.messaggi.future.length > 0
})
  
const mapDispatchToProps = dispatch => {
    return{
        onUndo: () => dispatch(ActionCreators.jump(-2)),
        onRedo: () => dispatch(ActionCreators.jump(2))
    }
}
  
let UndoRedo = ({ canUndo, canRedo, onUndo, onRedo }) => (
    <div>
        <button className="button-board round" onClick={onUndo} disabled={!canUndo}><i className="material-icons">undo</i></button>
        <button className="button-board round" onClick={onRedo} disabled={!canRedo}><i className="material-icons">redo</i></button>
    </div>
)

UndoRedo = connect(
    mapStateToProps,
    mapDispatchToProps
)(UndoRedo);

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
            console.log(response);

            response.data.messages.map(messaggio => {
                this.props.addMessaggio({id: uuidv1(), who: messaggio.who, what: "markdown", messaggio: messaggio.message, output: messaggio.outputs, code: messaggio.code});
            })

            response.data.variables.map(variabile => {
                this.props.addVariabile({ "name": variabile.name, "id": uuidv1() }); 
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
                    "text": value
                },
                "react": "true"
            }, {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            })
            .then(response => {
                this.props.addMessaggio({id: uuidv1(), who: "bot", what: "markdown", messaggio: response.data.message, output: response.data.outputs, code: response.data.code});
                console.log(response.data.code);
            })
        }
    }

    handleChange(evt){
        this.setState({ inputValue: evt.target.value });
    }

    render(){
        return (
            <div className="control">
                <UndoRedo />
                <input type="text" name="input" id="dialog" autoComplete="off" placeholder="Ask me something!" value={this.state.inputValue} onKeyPress={this.handleKeyPress} onChange={this.handleChange}/>
                <Upload addMessaggio={this.props.addMessaggio}/>
                <SaveJupyter />
                <LoadJupyter />
                <button className="button-board-lateral">Clear</button>
            </div>
        );
    }
}

const Form = connect(null, mapAddMessaggioEvent)(ConnectedForm);
export default Form;