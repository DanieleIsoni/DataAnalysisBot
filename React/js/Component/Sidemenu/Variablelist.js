import React from "react";
import { connect } from "react-redux";
import axios from 'axios';
import uuidv1 from "uuid";
import { deleteVariabile, addHints, addMessaggio } from "../../Actions/index";
import Action from '../../Constants/Actions';

const mapVariabili = state => {
    return { variabili: state.variabili.present };
};

const mapDeleteVar = dispatch => {
    return {
      deleteVariabile: id => dispatch(deleteVariabile(id)),
      addHints: hints => dispatch(addHints(hints)),
      addMessaggio: messaggio => dispatch(addMessaggio(messaggio)),
    };
};

class ConnectedList extends React.Component {
    constructor(props){
        super(props);
        this.deleteVariable = this.deleteVariable.bind(this);
    }

    componentDidUpdate(){
        if(this.props.variabili.length > 0){
            this.props.addHints(Action["after_file"]);
        }else{
            this.props.addHints(Action["initial"]);
        }     
    }

    deleteVariable(e, id, n) {
        axios.get('https://data-analysis-bot.herokuapp.com/delete/' + n)
        .then(response => {
            this.props.deleteVariabile(id);
            this.props.addMessaggio({id: uuidv1(), who: "bot", what: "markdown", messaggio: response.data, output: []});
        }) 
    }

    render() {
        return (
            <div className="variable-list">
                {
                    (this.props.variabili.length) ? 
                        this.props.variabili.map((el, n) => (
                            <div key={el.id} className={(this.props.selected == el.id) ? 'variable-container selected-var' : 'variable-container'} id={el.name} onClick={() => this.props.onClick(el)}>
                                {el.name} 
                                <span className="delete_var" onClick={(e) => this.deleteVariable(e, el.id, n)}><i className="material-icons close_var">close</i></span>
                            </div>
                        ))
                    :
                        <span className="side_message"><i className="material-icons">notification_important</i>No variable uploaded!</span>
                    }
            </div>
        );
    }
}

const List = connect(mapVariabili, mapDeleteVar)(ConnectedList);
export default List;