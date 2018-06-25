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

const Header = () => {
    return(
        <div className="variable-context">
            <div className="iridium">
                <img src="./dist/img/logov2.png"/>
                <div className="presentation"><h4>DAB</h4><span>Datascience Chatbot</span></div>
            </div>
        </div>
    );
}

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
                this.setState({
                    idVar: el.id,
                    selectedVar: el.name,
                    contentVar: data
                });
    
                this.props.setActiveVariable(this.state.selectedVar);
            
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
                <div className="side_subtitle"><h6><i className="material-icons">description</i><Translate id="detail">Variable Details</Translate></h6>                
                 {  (this.state.selectedVar) ? <a  className="code_command close_side" onClick={(e) => this.closeVar(e)}> <i className="material-icons">close</i></a> : ""}
                 </div>
                <JsonTable className="table table-hover" rows={this.state.contentVar.data} columns={getColumns(this.state.contentVar.schema.fields)}/>
            </div>
        ) : "";

        return (
            <Col xs="12" md="4" lg="3" className="gestione" style={{"display": this.props.show}}>
                <Header />
                <div className="variable-context">
                    <div className="side_subtitle"><h6><i className="material-icons">list</i> <Translate id="var">Variables</Translate> <span className="var_num">{this.props.variabili.length}</span></h6></div>
                    <List variabili={this.props.variabili} activeVar={this.props.activeVar} onClick={this.handleClick} selected={this.state.selectedVar} lang={sideTranslation} url={this.props.url}/>
                </div>
                <div className="divider"></div>
                {dettaglioVariabile}
                <Hints lang={sideTranslation}/>
                <div className="divider"></div>
                <div className="side_subtitle" style={{marginBottom: '10px'}}><h6><i className="material-icons">language</i><Translate id="lang">Language</Translate></h6><Language /></div>
                <div className="divider"></div>
            </Col>
        );
    }
}

const Sidemenu = connect(mapVariable, mapSetActive)(ConnectedSidemenu);
export default withLocalize(Sidemenu);