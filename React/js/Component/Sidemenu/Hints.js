import React from "react";
import { connect } from "react-redux";
import uuidv1 from "uuid";
import { Translate } from 'react-localize-redux';
import { withLocalize } from 'react-localize-redux';
import { sendMessage } from '../../Actions/Axios'
import AskModal from './AskModal';

const mapHints = state => {
    return { hints: state.hints.present };
};

class ConnectedList extends React.Component {
    constructor(props){
        super(props);
        this.props.addTranslation(props.lang);
        this.state = { 
            dropdownOpen: "none",
            ask: [],
            request: '',
            modal: false
        };
        this.toggle = this.toggle.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
    }

    toggle(e, esempio, name){
        if(e.target.id != "upload" && e.target.className != "" && e.target.className != "body_ex" && e.target.className != "writable"){
            this.setState({ dropdownOpen: (this.state.dropdownOpen == "none" || this.state.dropdownOpen != e.target.className) ? e.target.className : "none"});
        }else if(e.target.className == "writable"){
            sendMessage(e.target.innerHTML, "NL");
        }else{
            if(esempio.required != null){
                this.setState({request: { "content": esempio.content, "holder": esempio.holder, "name": name }, ask: esempio.required});
                this.toggleModal();
            }
        }
    }

    toggleModal(){
        this.setState({
            modal: !this.state.modal
        });
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
                                <li key={uuidv1()} onClick={(e) => this.toggle(e, esempio, el.name)}>
                                    <div className="body_ex">{esempio.content}</div>
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
                <AskModal modal={this.state.modal} toggle={() => this.toggleModal()} request={this.state.request} ask={this.state.ask}/>
            </div>
        );
    }
}

const HintList = connect(mapHints)(ConnectedList);
export default withLocalize(HintList);