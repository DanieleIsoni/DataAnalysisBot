import React from "react";
import { connect } from "react-redux";
import axios from 'axios';
import uuidv1 from "uuid";
import { deleteVariabile, addHints, addMessaggio } from "../../Actions/index";
import Action from '../../Constants/Actions';
import { Translate } from 'react-localize-redux';
import { withLocalize } from 'react-localize-redux';
import Upload from '../Control/Upload';
import { setActiveVariable} from "../../Actions/index";

const mapVariabili = state => {
    return { variabili: state.variabili.present, activeVar: state.active };
};

const mapDeleteVar = dispatch => {
    return {
      deleteVariabile: id => dispatch(deleteVariabile(id)),
      addHints: hints => dispatch(addHints(hints)),
      addMessaggio: messaggio => dispatch(addMessaggio(messaggio)),
      setActiveVariable: vari => dispatch(setActiveVariable(vari))
    };
};

class ConnectedList extends React.Component {
    constructor(props){
        super(props);
        this.props.addTranslation(props.lang);
        this.deleteVariable = this.deleteVariable.bind(this);
    }

    componentDidUpdate(){
        if(this.props.variabili.length > 0){
            this.props.addHints(Action["after_file"]);
        }else{
            this.props.addHints(Action["initial"]);
        }     
    }

    deleteVariable(e, id, n, name) {
        if(name == this.props.activeVar){
            this.props.setActiveVariable(null);
        }
        axios.get(this.props.url + '/delete/' + n)
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
                            <div key={el.id} className={(this.props.activeVar == el.name) ? 'variable-container selected-var' : 'variable-container'} id={el.name}>
                                <span onClick={() => this.props.onClick(el)}>{el.name}</span>
                                <span className="delete_var" onClick={(e) => this.deleteVariable(e, el.id, n, el.name)}><i className="material-icons close_var">close</i></span>
                            </div>
                        ))
                    :
                        ""//<span className="side_message"><i className="material-icons">notification_important</i><Translate id="novar">No Variable uploaded!</Translate></span>
                    }
                    <Upload addMessaggio={this.props.addMessaggio} url={this.props.url} theme={"side_add"} text={"Add Variable"}/>
            </div>
        );
    }
}

const List = connect(mapVariabili, mapDeleteVar)(ConnectedList);
export default withLocalize(List);