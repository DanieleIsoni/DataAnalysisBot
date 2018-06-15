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
        this.state = { dropdownOpen: "none" };
        this.toggle = this.toggle.bind(this);
    }

    toggle(e){
        this.setState({ dropdownOpen: (this.state.dropdownOpen == "none" || this.state.dropdownOpen != e.target.className) ? e.target.className : "none"});
    }

    render() {
        let dialog = (this.state.dropdownOpen != 'none') ?        
            <div className={this.state.dropdownOpen + "_container hint_container"}>
                <div className="head_hint"><Translate id={this.state.dropdownOpen + ".title"}></Translate></div>
                <div className="body_hint"><Translate id={this.state.dropdownOpen + ".body"}></Translate></div>
            </div> : "";

        const list = this.props.hints.map((el, n) => (
            <div key={uuidv1()} id={el.name} className="hint_container">
                <div className="head_hint">{el.name}</div>
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
        ));

        return (
            <div className="request_type">
                <div className="side_subtitle"><h6><i className="material-icons">question_answer</i><Translate id="queries">Language</Translate></h6></div>
                {list} 
                {dialog}
            </div>
        );
    }
}

const HintList = connect(mapHints)(ConnectedList);
export default withLocalize(HintList);