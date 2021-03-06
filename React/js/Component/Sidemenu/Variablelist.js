import React from "react";
import { connect } from "react-redux";
import { addHints, addMessage } from "../../Actions/index";
import sideTranslation from './translation';
import { Translate } from 'react-localize-redux';
import { withLocalize } from 'react-localize-redux';
import Upload from '../Control/Upload';
import { setActiveVariable} from "../../Actions/index";
import { call_deleteVariable } from '../../Actions/Axios';

const mapDeleteVar = dispatch => {
    return {
      addHints: hints => dispatch(addHints(hints)),
      addMessage: message => dispatch(addMessage(message)),
      setActiveVariable: variable => dispatch(setActiveVariable(variable))
    };
};

class ConnectedList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected_n: null,
            selected_id: null,
            openAttr: false
        }
        this.delete = this.delete.bind(this);
        this.openAttribute = this.openAttribute.bind(this);
    }

    componentDidUpdate(){
        if(this.props.variabili.length > 0) this.props.addHints("after_file");  
        else this.props.addHints("initial");   
    }

    openAttribute(e){
        this.setState({
            openAttr: !this.state.openAttr
        });
    }

    delete(e, name) {
        if(name === this.props.activeVar.name) this.props.setActiveVariable(null);
        call_deleteVariable(name);
    }

    render() {
        var selected = (this.props.activeVar) ?
        <div className='variable-selected'>
            <h5 className="body_text" style={{padding: '5px'}}>Active context dataset</h5>
            <div className='variable-container selected-var'>
                <span>{this.props.activeVar.name}</span>
            </div>
            <br />
            <div className='variable-container' style={{background: 'white'}} onClick={() => this.props.describe(this.props.activeVar.name)}>
                <span>Describe <i className="material-icons">chevron_right</i></span>
            </div>
            {
                (this.props.activeVar.head != null) ? 
                    <div className='variable-container' style={{background: 'white'}} onClick={() => this.props.head(this.props.activeVar.name)}>
                        <span>Head <i className="material-icons">chevron_right</i></span>
                    </div> : ''
            }

            <div className='variable-container' style={{background: 'white'}} onClick={(e) => this.openAttribute(e)}>
                <span>Attribute list <i className="material-icons">chevron_right</i></span>
            </div>
            {
                (this.props.activeVar.attributes != null && this.state.openAttr) ? 
                <div style={{marginBottom: '10px'}}>
                    <h6 className="body_text">Attributes</h6>
                    {
                        this.props.activeVar.attributes.map((attribute) => {
                            return <span className="attributes_list">{attribute}</span>
                        })
                    }   
                </div>
                : ''
            }
            <div className='variable-container' style={{background: '#ff5050'}} onClick={(e) => this.delete(e, this.props.activeVar.name)}>
                <span style={{color: 'white'}}>Delete <i className="material-icons">close</i></span>
            </div>
        </div>
        : ''

        return (
                <div className="variable-list">
                    {selected}
                    {/*
                        (this.props.variabili.length) ? 
                            this.props.variabili.map((el, n) => (
                                (this.props.activeVar != null && this.props.activeVar.name != el.name) ? 
                                    <div key={el.id} className='variable-container' id={el.name} onClick={() => this.props.onClick(el)}>
                                        <span>{el.name}</span>
                                    </div>
                                    :
                                ''
                            ))
                        :""*/
                    }
                    <Upload addMessaggio={this.props.addMessage} url={this.props.url} theme={"side_add"} text={"Add Datasets"}/>
                </div>
        );
    }
}

const List = connect(null, mapDeleteVar)(ConnectedList);
export default withLocalize(List);