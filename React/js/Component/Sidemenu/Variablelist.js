import React from "react";
import { connect } from "react-redux";
import { addHints, addMessage } from "../../Actions/index";
import { withLocalize } from 'react-localize-redux';
import Upload from '../Control/Upload';
import { setActiveDataset} from "../../Actions/index";
import { call_deleteVariable } from '../../Actions/Axios';

const mapDeleteVar = dispatch => {
    return {
      addHints: hints => dispatch(addHints(hints)),
      addMessage: message => dispatch(addMessage(message)),
      setActiveDataset: dataset => dispatch(setActiveDataset(dataset))
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
        if(this.props.datasets.length > 0) this.props.addHints("after_file");
        else this.props.addHints("initial");   
    }

    openAttribute(e){
        this.setState({
            openAttr: !this.state.openAttr
        });
    }

    delete(e, name) {
        if(name === this.props.activeVar.name) this.props.setActiveDataset(null);
        call_deleteVariable(name);
    }

    render() {
        var selected = (this.props.activeVar) ?
        <div className='variable-selected'>
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
                    <Upload addMessaggio={this.props.addMessage} url={this.props.url} theme={"side_add"} text={"Add Datasets"}/>
                </div>

                /**
                 *  <div className='variable-container selected-var'>
                        <span>{this.props.activeVar.name}</span>
                    </div>
                 */
        );
    }
}

const List = connect(null, mapDeleteVar)(ConnectedList);
export default withLocalize(List);