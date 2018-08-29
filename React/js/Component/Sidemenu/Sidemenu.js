import './sidemenu.css';
import React from "react";
import { connect } from "react-redux";
import List from './Variablelist';
import Hints from './Hints';
import { Col } from 'reactstrap';
const JsonTable = require('ts-react-json-table');
import { Translate } from 'react-localize-redux';
import sideTranslation from './translation';
import { withLocalize } from 'react-localize-redux';
import { setActiveDataset} from "../../Actions/index";
import { getVariable } from  '../../Actions/Axios'
import Help from './Help';

const mapSetActive = dispatch => {
    return {
      setActiveDataset: dataset => dispatch(setActiveDataset(dataset))
    };
};

const mapVariable = state => {
    return { datasets: state.datasets.present, activeVar: state.active };
};

class ConnectedSidemenu extends React.Component {
    constructor(props){
        super(props);
        this.props.addTranslation(sideTranslation);
        this.state = {
            idVar: '',
            selectedVar: '',
            contentVar: [],
            described: false,
            headed: false,
            tab_active: "dashboard"
        }
        this.handleClick = this.handleClick.bind(this);
        this.handleDescribe= this.handleDescribe.bind(this);
        this.closeVar = this.closeVar.bind(this);
        this.handleHead = this.handleHead.bind(this);
    }

    handleClick (el) {
        this.setState({
            idVar: el.id,
            selectedVar: el.name,
        });

        this.props.setActiveDataset({"name": el.name, "attributes": el.attributes, "head": el.head});
    }

    handleDescribe(name){
        this.setState({ described: !this.state.described });
    }
    handleHead(name){
        this.setState({ headed: !this.state.headed });
    }
    closeHead (e){
        this.setState({ headed: false });
    }
    closeVar (e){
        this.setState({ described: false });
    }

    render () {
        let getColumns = (columns) => {
            var array = [];
            for(let i = 0; i < columns.length; i++) array.push(columns[i].name);
            return array;
        }

        const detailDataset = (this.state.described) ? (
            <div className="variable-detail">
                <div className="side_subtitle"><h6><i className="material-icons">description</i><Translate id="detail">Describe Dataset</Translate></h6>                
                 {  (this.state.described) ? <a  className="code_command close_side" onClick={(e) => this.closeVar(e)}> <i className="material-icons">close</i></a> : ""}
                 </div>
                <JsonTable className="table table-hover" rows={this.props.activeVar.describe.data} columns={getColumns(this.props.activeVar.describe.schema.fields)}/>
            </div>
        ) : "";

        const headDataset = (this.state.headed) ? (
            <div className="variable-detail">
                <div className="side_subtitle"><h6><i className="material-icons">description</i><Translate id="head">Head of Dataset</Translate></h6>                
                 {  (this.state.headed) ? <a  className="code_command close_side" onClick={(e) => this.closeHead(e)}> <i className="material-icons">close</i></a> : ""}
                 </div>
                 <span className="preview_csv">
                    <JsonTable className="table table-hover" settings={{header: false}} rows={this.props.activeVar.head}/>
                </span>
            </div>
        ) : "";

        return (
            <Col xs="12" md="5" lg="4" className="gestione" style={{"display": this.props.show}}>
                <div className="tabs_sidemenu">
                    <div className={(this.state.tab_active == "dashboard") ? "tab_side_active tab_side" : "tab_side"} onClick={(e) => this.setState({tab_active: "dashboard"})}><span>Dashboard</span></div>
                    <div className={(this.state.tab_active == "help") ? "tab_side_active tab_side" : "tab_side"} onClick={(e) => this.setState({tab_active: "help"})}><span>Help & Settings</span></div>
                    <div className="tab_bar" style={{left: (this.state.tab_active == "dashboard") ? '0%' : '50%'}}></div>
                </div>
                {
                    (this.state.tab_active === "dashboard") ?
                        <div>
                            <List datasets={this.props.datasets} activeVar={this.props.activeVar} onClick={this.handleClick} describe={this.handleDescribe} head={this.handleHead} selected={this.state.selectedVar} lang={sideTranslation} url={this.props.url}/>
                            {headDataset}
                            {detailDataset}
                            <div style={{display: 'block'}}>
                                <Hints lang={sideTranslation}/>
                            </div>
                        </div>
                    :
                        <Help />
                }

            </Col>
        );
    }
}

const Sidemenu = connect(mapVariable, mapSetActive)(ConnectedSidemenu);
export default withLocalize(Sidemenu);