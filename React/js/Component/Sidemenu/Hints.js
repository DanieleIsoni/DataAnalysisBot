import React from "react";
import { connect } from "react-redux";
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
        switch(e.target.className){
            case "operation":
                this.setState({ dropdownOpen: (this.state.dropdownOpen == "none" || this.state.dropdownOpen != "operation") ? "operation" : "none"});
                break;
            case "attribute":
                this.setState({ dropdownOpen: (this.state.dropdownOpen == "none" || this.state.dropdownOpen != "attribute") ? "attribute" : "none"});
                break;
            case "color":
                this.setState({ dropdownOpen: (this.state.dropdownOpen == "none" || this.state.dropdownOpen != "color") ? "color" : "none"});
                break;
            case "asse":
                this.setState({ dropdownOpen: (this.state.dropdownOpen == "none" || this.state.dropdownOpen != "asse") ? "asse" : "none"});
                break;
            case "font":
                this.setState({ dropdownOpen: (this.state.dropdownOpen == "none" || this.state.dropdownOpen != "font") ? "font" : "none"});
                break;
            default:
                this.setState({ dropdownOpen: 'none' });
        }
    }

    render() {
        let dialog =               
            <div className={this.state.dropdownOpen + "_container hint_container"}>
                <div className="head_hint"><h5><Translate id={this.state.dropdownOpen + ".title"}></Translate></h5></div>
                <div className="body_hint"><Translate id={this.state.dropdownOpen + ".body"}></Translate>
                </div>
            </div>

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
                    dialog
                    :
                    ""
                }
            </div>
        );
    }
}

const HintList = connect(mapHints)(ConnectedList);
export default withLocalize(HintList);