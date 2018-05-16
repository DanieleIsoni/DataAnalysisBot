import React from "react";
import { connect } from "react-redux";
import axios from 'axios';

const mapVariabili = state => {
    return { variabili: state.variabili.present };
};

class ConnectedList extends React.Component {
    render() {
        return (
            <div className="variable-list">
                {
                    (this.props.variabili.length) ? 
                        this.props.variabili.map(el => (
                            <div key={el.id} className={(this.props.selected == el.id) ? 'variable-container selected-var' : 'variable-container'} id={el.name} onClick={() => this.props.onClick(el)}>{el.name} <span><i className="material-icons close_var">close</i></span></div>
                        ))
                    :
                        <span className="side_message"><i className="material-icons">notification_important</i>No variable uploaded!</span>
                    }
            </div>
        );
    }
}

const List = connect(mapVariabili)(ConnectedList);
export default List;