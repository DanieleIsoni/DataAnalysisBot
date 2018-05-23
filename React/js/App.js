import React from "react";
import { connect } from "react-redux";
import { Container, Row, Col } from 'reactstrap';
import { withLocalize } from 'react-localize-redux';    
/* Componenti */
import Chat from "./Component/Chat/Chat";
import Sidemenu from "./Component/Sidemenu/Sidemenu";
import Form from "./Component/Control/Form";
/* ---------- */

class App extends React.Component {
    constructor(props){
        super(props);
        this.props.initialize({
            languages: [
              { name: 'English', code: 'en' },
              { name: 'Russian', code: 'ru' }
            ]
        });
        this.state = { side: "none" }
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(e){
        this.setState({ side: (this.state.side == "block") ? "none" : "block" })
    }

    render () {
        return (
            <Container fluid={true} >
                <Row>
                    <Chat />
                    <Sidemenu show={this.state.side}/>
                    <Form />
                </Row>   
                <div className="openSide" onClick={this.handleClick}><i className="material-icons">keyboard_arrow_down</i></div>
            </Container>   
        );
    }
}

export default withLocalize(App);