import React from "react";
import { connect } from "react-redux";
import axios from 'axios';
import uuidv1 from "uuid";
import { Translate } from 'react-localize-redux';
import { withLocalize } from 'react-localize-redux';

const mapHints = state => {
    return { hints: state.hints.present };
};

class ConnectedList extends React.Component {
    constructor(props){
        super(props);
        this.props.addTranslation(props.lang);
        this.toggle = this.toggle.bind(this);
        this.state = {
            dropdownOpen: "none"
        };
    }

    toggle(e){
        if(e.target.className == "operation"){
            this.setState({ dropdownOpen: (this.state.dropdownOpen == "none" || this.state.dropdownOpen == "attribute") ? "operation" : "none"});
        }else if(e.target.className == "attribute"){
            this.setState({ dropdownOpen: (this.state.dropdownOpen == "none" || this.state.dropdownOpen == "operation") ? "attribute" : "none"});
        }else{
            this.setState({ dropdownOpen: 'none' });
        }
    }

    render() {
        return (
            <div className="request_type">
                <div className="side_subtitle"><h5><i className="material-icons">question_answer</i><Translate id="queries">Language</Translate></h5></div>
                {
                    this.props.hints.map((el, n) => (
                        <div key={uuidv1()} id={el.name} className="hint_container">
                            <div className="head_hint"><h5>{el.name}</h5></div>
                            <ul className="list_hint">
                                {
                                    el.esempi.map(esempio => {
                                        return(
                                            <li key={uuidv1()} onClick={this.toggle}>
                                                <div className="body_ex">{esempio}</div>
                                            </li> 
                                        );
                                    })
                                }
                            </ul>
                        </div>
                    ))
                }   
                {
                    (this.state.dropdownOpen != 'none') ? 
                    (this.state.dropdownOpen == "operation") ? 
                        <div className="hint_container red_container">
                            <div className="head_hint"><h5><Translate id="op.title">Operation</Translate></h5></div>
                            <div className="body_hint"><Translate id="op.body">Type of math and statistics operation, like "Average", "Maximum", "std".
                            You can uso the abbreviation alias, avg, max, min...</Translate>
                            </div>
                        </div>
                        :
                        <div className="hint_container blue_container">
                            <div className="head_hint"><h5><Translate id="attr.title">Attribute</Translate></h5></div>
                            <div className="body_hint"><Translate id="attr.body">Attribute is the name of the columns and row assigned to the loaded dataset.
                            If the first line of the dataset doesnt have the name of the column the system takes makes the name numerics</Translate>
                            </div>
                        </div>
                    :
                    ""
                }
            </div>
        );
    }
}

const HintList = connect(mapHints)(ConnectedList);
export default withLocalize(HintList);