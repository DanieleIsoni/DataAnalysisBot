import React from "react";
import { connect } from "react-redux";
import { addHints, addMessage } from "../../Actions/index";
import Action from '../../Constants/Actions';
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
            selected_id: null
        }
        this.delete = this.delete.bind(this);
    }

    componentDidUpdate(){
        if(this.props.variabili.length > 0) this.props.addHints(Action["after_file"]);  
        else this.props.addHints(Action["initial"]);   
    }


    delete(e, name) {
        if(name === this.props.activeVar) this.props.setActiveVariable(null);
        call_deleteVariable(name);
    }

    render() {
        var selected = (this.props.activeVar) ?
        <div className='variable-selected'>
            <h6 className="body_text">Active Dataset</h6>
            <div className='variable-container selected-var'>
                <span>{this.props.activeVar}</span>
            </div>
            <div className='variable-container' style={{background: '#ff5050'}}>
                <span onClick={(e) => this.delete(e, this.props.activeVar)} style={{color: 'white'}}>Delete <i className="material-icons">close</i></span>
            </div>
            <div className='variable-container' style={{background: 'white'}}>
                <span onClick={() => this.props.describe(this.props.activeVar)}>Describe <i className="material-icons">chevron_right</i></span>
            </div>
        </div>
        : ''

        return (
            <div className="variable-list">
                {selected}
                {
                    (this.props.variabili.length) ? 
                        this.props.variabili.map((el, n) => (
                            (this.props.activeVar != el.name) ? 
                                <div key={el.id} className='variable-container' id={el.name} onClick={() => this.props.onClick(el)}>
                                    <span>{el.name}</span>
                                </div>
                                :
                            ''
                        ))
                    :""
                }
                <Upload addMessaggio={this.props.addMessage} url={this.props.url} theme={"side_add"} text={"Add Datasets"} activeVar={this.props.activeVar}/>
            </div>
        );
    }
}

const List = connect(null, mapDeleteVar)(ConnectedList);
export default List;