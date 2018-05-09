import React from "react";
import { connect } from "react-redux";
import axios from 'axios';

const mapVariabili = state => {
    return { variabili: state.variabili };
};

class ConnectedList extends React.Component {
    render() {
        return (
            <div className="variable-list">
                {this.props.variabili.map(el => (
                    <div key={el.id} className={(this.props.selected == el.id) ? 'variable-container selected-var' : 'variable-container'} id={el.name} onClick={() => this.props.onClick(el)}>{el.name}</div>
                ))}
            </div>
        );
    }
}

const List = connect(mapVariabili)(ConnectedList);
export default List;