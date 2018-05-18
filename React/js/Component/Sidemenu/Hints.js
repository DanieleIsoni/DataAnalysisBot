import React from "react";
import { connect } from "react-redux";
import axios from 'axios';
import uuidv1 from "uuid";

const mapHints = state => {
    return { hints: state.hints.present };
};

class ConnectedList extends React.Component {
    constructor(props){
        super(props);
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
                <div className="side_subtitle"><h5><i className="material-icons">question_answer</i> Possible queries</h5></div>
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
                            <div className="head_hint"><h5>Operation</h5></div>
                            <div className="body_hint">Type of math and statistics operation, like "Average", "Maximum", "std". <br />
                            You can uso the abbreviation alias, avg, max, min...
                            </div>
                        </div>
                        :
                        <div className="hint_container blue_container">
                            <div className="head_hint"><h5>Attribute</h5></div>
                            <div className="body_hint">Attribute is the name of the columns and row assigned to the loaded dataset. <br />
                            If the first line of the dataset doesn't have the name of the column the system takes makes the name numerics
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
export default HintList;