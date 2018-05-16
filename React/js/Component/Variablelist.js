import React from "react";
import { connect } from "react-redux";
import axios from 'axios';
import { deleteVariabile } from "../Actions/index";

const mapVariabili = state => {
    return { variabili: state.variabili.present };
};

const mapDeleteVar = dispatch => {
    return {
      deleteVariabile: id => dispatch(deleteVariabile(id))
    };
};

class ConnectedList extends React.Component {

    constructor(props){
        super(props);
        this.deleteVariable = this.deleteVariable.bind(this);
    }

    deleteVariable(e, id, n) {
        axios.get('https://data-analysis-bot.herokuapp.com/delete/' + n)
        .then(response => {
            this.props.deleteVariabile(id);
        }) 
    }

    render() {
        return (
            <div className="variable-list">
                {
                    (this.props.variabili.length) ? 
                        this.props.variabili.map((el, n) => (
                            <div key={el.id} className={(this.props.selected == el.id) ? 'variable-container selected-var' : 'variable-container'} id={el.name} onClick={() => this.props.onClick(el)}>{el.name} <span onClick={(e) => this.deleteVariable(e, el.id, n)}><i className="material-icons close_var">close</i></span></div>
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