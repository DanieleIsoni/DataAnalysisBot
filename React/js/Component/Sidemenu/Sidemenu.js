import React from "react";
import { connect } from "react-redux";
import axios from 'axios';
import List from './Variablelist';
import './sidemenu.css';

const JsonTable = require('ts-react-json-table');

const mapVariabili = state => {
    return { variabili: state.variabili.present };
};

class ConnectedSidemenu extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            idVar: '',
            selectedVar: '',
            contentVar: [],
            savedJup: 'Save Jupyter Notebook'
        }
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick (el) {
        axios.get('https://data-analysis-bot.herokuapp.com/variable/' + el.name, {responseType: 'json'})
        .then(response => {
            if(typeof response.data.schema != "undefined"){
                this.setState({
                    idVar: el.id,
                    selectedVar: el.name,
                    contentVar: response.data
                });
            }
        })
    }

    render () {
        let getColumns = (columns) => {
            var array = [];
            for(let i = 0; i < columns.length; i++){
                array.push(columns[i].name);
            }
            return array;
        }

        const dettaglioVariabile = (this.state.selectedVar) ? (
            <div className="variable-detail">
                <div className="side_subtitle"><h5><i className="material-icons">description</i>Dettagli Variabile</h5></div>
                <JsonTable className="table table-bordered table-hover" rows={this.state.contentVar.data} columns={getColumns(this.state.contentVar.schema.fields)}/>
            </div>
        ) : (
            <div className="variable-detail"></div>
        );

        return (
            <div className="gestione col-12 col-md-4 col-lg-4" style={{"display": this.props.show}}>
                <div className="variable-context">
                    <div className="side_subtitle"><h5><i className="material-icons">list</i> Variables <span className="var_num">{this.props.variabili.length}</span></h5></div>
                    <List onClick={this.handleClick} selected={this.state.idVar}/>
                </div>
                {dettaglioVariabile}
                <div className="request_type">
                    <div className="side_subtitle"><h5><i className="material-icons">question_answer</i> Possible queries</h5></div>
                    
                </div>
            </div>
        );
    }
}

const Sidemenu = connect(mapVariabili)(ConnectedSidemenu);
export default Sidemenu;