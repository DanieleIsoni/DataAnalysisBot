import React from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { sendMessage } from '../../Actions/Axios';
import { Translate } from 'react-localize-redux';
import { withLocalize } from 'react-localize-redux';
import Autocomplete from 'react-autocomplete';

const getSuggestionValue = suggestion => suggestion;

const renderSuggestion = suggestion => (
    <div>
        {suggestion}
    </div>
);

class AskModal extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            html: '',
            required: {

            },
            showLoader: false,
            dropdownOpen: "none",
            value: '',
            suggestions: []
        }
        this.handleSubmit = this.handleSubmit.bind(this);
        this.toggleHelp = this.toggleHelp.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(this);
        this.onSuggestionsClearRequested = this.onSuggestionsClearRequested.bind(this);
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

    handleChange(e, inp){
        var req = this.state.required;
        req[inp] = e.target.value;

        this.setState({
            required: req
        });
    }

    handleSubmit(e){
        e.preventDefault();
        var holder = this.props.request.holder;
        var ask = this.props.ask;

        var index = this.getIndicesOf('%s', holder, false);

        var message = holder;
        for(var i = index.length-1; i >= 0; i--){
            message = message.substr(0,index[i]) + this.state.required[ask[i]] + message.substr(index[i] + 2);
        }

        this.setState({ showLoader: true });

        sendMessage(message, "NL").then(() => {
            this.setState({
                html: '',
                required: { },
                showLoader: false
            });
            this.props.toggle();
        }).catch((error) => {
            console.log("Errore: " + error);
            this.props.toggle();
        })
    }

    onChange (event, { newValue }) {
        var req = this.state.required;
        req["Attribute"] = newValue;
        
        this.setState({
            value: newValue,
            required: req
          });
    }

    toggleHelp(e, element){
        if(element == null && e.target.id != "upload" && e.target.className != "" && e.target.className != "body_ex" && e.target.className != "writable"){
            this.setState({ dropdownOpen: (this.state.dropdownOpen == "none" || this.state.dropdownOpen != e.target.className) ? e.target.className : "none"});
        }

        if(element != null){
            this.setState({ dropdownOpen: element.split(" ")[0].toLowerCase()});
        }
    }

    onSuggestionsFetchRequested ({ value }){
        this.setState({
          suggestions: this.getSuggestions(value)
        });
    };

    onSuggestionsClearRequested (){
        this.setState({
            suggestions: []
        });
    };

    getSuggestions (value) {
        const inputValue = value;
        const inputLength = inputValue.length;

        let restricted = [];
        (inputLength === 0 || this.props.active == null) ?
            restricted = [] 
            : 
                this.props.active.attributes.forEach(function(value) {
                    var regex = new RegExp('' + inputValue + '');
                    if(regex.test(value)){
                        restricted.push(value);
                    }
                });
        return restricted;
    };
    

    render(){
        let dialog = (this.state.dropdownOpen != 'none') ?        
        <div className={this.state.dropdownOpen + "_container hint_container"}>
            <div className="head_hint"><Translate id={this.state.dropdownOpen + ".title"}></Translate></div>
            <div className="body_hint"><Translate id={this.state.dropdownOpen + ".body"}></Translate></div>
        </div> : "";

        const { value,  suggestions } = this.state;
        const inputProps = {
            placeholder: 'Type a columns name...',
            value,
            onChange: this.onChange,
            className: "input_ask attribute_input"
        }

        return (
            <Modal isOpen={this.props.modal} toggle={this.props.toggle} className="upload_modal">
                <ModalHeader>{this.props.request.name}</ModalHeader>   
                <ModalBody>
                    <span className="body_text" onClick={(e) => this.toggleHelp(e, null)}>
                        {(this.state.html == '') ? this.props.request.content : this.state.html}
                    </span>
                    <div className="divider"></div>
                    <div className="form_ask">
                    {
                        this.props.ask.map((single) => {
                            return (
                                <div className="input_list">
                                    <h6 className={single.toLowerCase()}>{single}:</h6>
                                    {
                                        (single == "Attribute" || single.substr(0, single.indexOf(' ')) == "Attribute") ? 
                                        <Autocomplete
                                            getItemValue={(item) => item}
                                            shouldItemRender={(item, value) => item.toLowerCase().indexOf(value.toLowerCase()) > -1}
                                            items={(this.props.active != null) ? this.props.active.attributes : []}
                                            renderItem={(item, isHighlighted) =>
                                                <div style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
                                                {item}
                                                </div>
                                            }
                                            value={this.state.required[single]}
                                            onChange={(e) => this.handleChange(e, single)}
                                            onSelect={value => {
                                                var req = this.state.required;
                                                req[single] = value;
                                                this.setState({ required: req })
                                            }}
                                            inputProps={{
                                                className: "input_ask attribute_input",
                                                placeholder: "Type a name of the columns..."
                                            }}
                                            wrapperProps={{
                                                style: {flexGrow: 1}
                                            }}
                                            menuStyle={{
                                                    borderRadius: '5px',
                                                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
                                                    background: 'rgba(255, 255, 255, 0.9)',
                                                    padding: '5px 10px',
                                                    fontSize: '15px',
                                                    position: 'fixed',
                                                    marginTop: '-20px',
                                                    left: '0 !important',
                                                    overflow: 'auto',
                                                    maxHeight: '50%', // TODO: don't cheat, let it flow to the bottom
                                            }}
                                        />
                                        :
                                        <input id={single} type="text" name={single} className="input_ask" placeholder={single+"..."} onChange={(e) => this.handleChange(e, single)} onFocus={(e) => this.toggleHelp(e, single)}/>
                                    }
                                </div>
                            );
                        })
                    }
                    </div>
                    {(this.state.dropdownOpen != 'none') ? dialog : <span className="body_text" >Click on the element for help</span>}
                </ModalBody>
                <ModalFooter>
                    <Button className="cancel" onClick={this.props.toggle}>Cancel</Button>
                    <Button innerRef={(button) => (this.sendFile = button)} onClick={this.handleSubmit} color="primary">Invia</Button>{' '}
                    { (this.state.showLoader) ? <div className="lds-ellipsis loader-black"><div></div><div></div><div></div><div></div></div> : ""}
                </ModalFooter>
            </Modal>
        );
    }
}

export default withLocalize(AskModal);