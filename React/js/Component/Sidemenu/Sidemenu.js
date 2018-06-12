import './sidemenu.css';
import React from "react";
import { connect } from "react-redux";
import List from './Variablelist';
import Hints from './Hints';
import Language from './LanguageToggle';
import { Col } from 'reactstrap';
const JsonTable = require('ts-react-json-table');
import { Translate } from 'react-localize-redux';
import sideTranslation from './translation';
import { withLocalize } from 'react-localize-redux';
import { setActiveVariable} from "../../Actions/index";
import { getVariable } from  '../../Actions/Axios'

const mapSetActive = dispatch => {
    return {
      setActiveVariable: vari => dispatch(setActiveVariable(vari))
    };
};

const mapVariable = state => {
    return { variabili: state.variabili.present, activeVar: state.active };
};

class ConnectedSidemenu extends React.Component {
    constructor(props){
        super(props);
        this.props.addTranslation(sideTranslation);
        this.state = {
            idVar: '',
            selectedVar: '',
            contentVar: []
        }
        this.handleClick = this.handleClick.bind(this);
        this.closeVar = this.closeVar.bind(this);
    }

    handleClick (el) {
        getVariable(el.name).then((data) => {
            if(typeof data.schema != "undefined"){
                this.setState({
                    idVar: el.id,
                    selectedVar: el.name,
                    contentVar: data
                });
    
                this.props.setActiveVariable(this.state.selectedVar);
            }
        }).catch(err => console.log('There was an error:' + err));
    }

    closeVar (e){
        this.setState({
            idVar: '',
            selectedVar: '',
            contentVar: []
        }); 
    }

    render () {
        let getColumns = (columns) => {
            var array = [];
            for(let i = 0; i < columns.length; i++) array.push(columns[i].name);
            return array;
        }

        const dettaglioVariabile = (this.state.selectedVar) ? (
            <div className="variable-detail">
                <div className="side_subtitle"><h5><i className="material-icons">description</i><Translate id="detail">Variable Details</Translate></h5>                
                 {  (this.state.selectedVar) ? <a  className="code_command close_side" onClick={(e) => this.closeVar(e)}> <i className="material-icons">close</i></a> : ""}
                 </div>
                <JsonTable className="table table-hover" rows={this.state.contentVar.data} columns={getColumns(this.state.contentVar.schema.fields)}/>
            </div>
        ) : (<div className="variable-detail"></div>);

        return (
            <Col xs="12" md="4" className="gestione" style={{"display": this.props.show}}>
                <div className="variable-context">
                    <div className="side_subtitle"><h5><i className="material-icons">list</i> <Translate id="var">Variables</Translate> <span className="var_num">{this.props.variabili.length}</span></h5></div>
                    <List variabili={this.props.variabili} activeVar={this.props.activeVar} onClick={this.handleClick} selected={this.state.selectedVar} lang={sideTranslation} url={this.props.url}/>
                </div>
                {dettaglioVariabile}
                <Hints lang={sideTranslation}/>
                <div className="side_subtitle"><h5><i className="material-icons">language</i><Translate id="lang">Language</Translate> (Test)</h5><Language /></div>
            </Col>
        );
    }
}

const Sidemenu = connect(mapVariable, mapSetActive)(ConnectedSidemenu);
export default withLocalize(Sidemenu);