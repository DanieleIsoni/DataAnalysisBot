import React from "react";
import { connect } from "react-redux";
import uuidv1 from "uuid";
import { Translate } from 'react-localize-redux';
import { withLocalize } from 'react-localize-redux';
import { sendMessage } from '../../Actions/Axios'
import AskModal from './AskModal';
import Action from '../../Constants/Actions';

const mapHints = state => {
    return { hint: state.hints, active: state.active };
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
        this.toggleOnOver = this.toggleOnOver.bind(this);
        this.toggleOnOut = this.toggleOnOut.bind(this);
    }


    toggle(e, esempio, name){
        if(e.target.className == "writable"){
            sendMessage(e.target.innerHTML, "NL");
        }else{
            if(esempio.required != null){
                this.setState({request: { "content": esempio.content, "holder": esempio.holder, "name": name }, ask: esempio.required});
                this.toggleModal();
            }
        }
    }

    toggleOnOut(e){
        this.setState({ dropdownOpen: "none"});
    }

    toggleOnOver(e){
        if(e.target.id != "upload" && e.target.className != "" && e.target.className != "body_ex" && e.target.className != "writable"){
            this.setState({ dropdownOpen: e.target.className });
        }
    }

    toggleModal(){
        this.setState({
            modal: !this.state.modal
        });
    }

    getIndicesOf(searchStr, str, caseSensitive){
        var searchStrLen = searchStr.length;
        if (searchStrLen == 0) {
            return [];
        }
        var startIndex = 0, index, indices = [];
        if (!caseSensitive) {
            str = str.toLowerCase();
            searchStr = searchStr.toLowerCase();
        }
        while ((index = str.indexOf(searchStr, startIndex)) > -1) {
            indices.push(index);
            startIndex = index + searchStrLen;
        }
        return indices;
    }


    generateExample(esempio){
        var holder =  esempio.holder;
        var operation = ["avg", "average", "mean", "minimum", "max"];
        
        if(holder != null){
            var index = this.getIndicesOf('%s', holder, false);
            var message = holder;
            var required = esempio.required;

            for(var i = index.length-1; i >= 0; i--){
                if(required[i] == "Attribute" || required[i].substr(0, required[i].indexOf(" ")) == "Attribute"){
                    if(this.props.active != null && this.props.active.attributes != null){
                        message = message.substr(0,index[i]) + this.props.active.attributes[Math.floor(Math.random()*this.props.active.attributes.length)] + message.substr(index[i] + 2);
                    }
                }

                switch(required[i]){
                    case "Operation":
                        message = message.substr(0,index[i]) + operation[Math.floor(Math.random()*operation.length)] + message.substr(index[i] + 2);
                        break;
                    case "Axis":
                    case "Color":
                    case "Font": 
                        return esempio.content;
                }
            }

            return <div>{message}</div>;
        }else{
            return esempio.content;
        }
    }

    render() {
        let dialog = (this.state.dropdownOpen != 'none') ?        
            <div className={this.state.dropdownOpen + "_container hint_container"}>
                <div className="head_hint"><Translate id={this.state.dropdownOpen + ".title"}></Translate></div>
                <div className="body_hint"><Translate id={this.state.dropdownOpen + ".body"}></Translate></div>
            </div> : "";
            
        const list = Action[this.props.hint].map((el, n) => (
            <div key={uuidv1()} id={el.name} className="hint_container">
                <div className="head_hint">{el.name}</div>
                <ul className="list_hint">
                    {
                        el.esempi.map(esempio => {
                            return(
                                <li key={uuidv1()} onClick={(e) => this.toggle(e, esempio, el.name)}>
                                    <div className="body_ex">{this.generateExample(esempio)}</div>
                                </li> 
                            );
                        })
                    }
                </ul>
            </div>
        ));

        return (
            <div className="request_type">
                <div className="side_subtitle" style={{flexBasis: '100%'}}><h6><i className="material-icons">question_answer</i><Translate id="queries">Language</Translate></h6></div>
                {list} 
                {dialog}
                <AskModal modal={this.state.modal} toggle={() => this.toggleModal()} request={this.state.request} ask={this.state.ask} active={this.props.active}/>
            </div>
        );
    }
}

const HintList = connect(mapHints)(ConnectedList);
export default withLocalize(HintList);