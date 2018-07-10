import React from 'react';
import Operations from '../../Constants/Operations';
import uuidv1 from "uuid";
import Language from './LanguageToggle';
import { Translate } from 'react-localize-redux';
import { withLocalize } from 'react-localize-redux';


const Header = () => {
    return(
        <div className="variable-context presentation" style={{margin: '0', padding: '0 10px'}}>
            <div className="iridium">
                <img src="./dist/img/logov2.png"/>
                <div className="presentation"><h5>DABOT</h5><span>Datascience Chatbot</span></div>
            </div>
        </div>
    );
}

class Help extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            restricted: [],
            search: ''
        }

        this.onChange = this.onChange.bind(this);
    }

    componentDidMount(){
        this.setState({ restricted: Operations });
    }

    onChange(e){
        var inputValue = e.target.value.toLowerCase();
        var restricted = [];

        Operations.map(ope => {
            var regex = new RegExp('' + inputValue + '');
            if(regex.test(ope.name.toLowerCase())){
                restricted.push(ope);
            }
        });

        this.setState({ search: inputValue, restricted: restricted })
    }

    render() {
        return (
            <div>
                <Header />
                <div className="side_subtitle" style={{marginBottom: '10px'}}><h6><i className="material-icons">language</i><Translate id="lang">Language</Translate></h6><Language /></div>
                <div className="divider"></div>
                <input className="input_ask search_help" placeholder="Search what you need..." onChange={(e) => this.onChange(e)}/>
                <div className="request_type">
                    {
                        this.state.restricted.map((ope) => {
                            return (
                                <div key={uuidv1()} className="hint_container">
                                    <div className="head_hint">{ope.name}</div>
                                    <div className="body_hint">{ope.description}</div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        );
    }
}

export default withLocalize(Help);