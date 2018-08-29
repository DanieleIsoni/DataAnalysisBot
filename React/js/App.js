import React from "react";
import { Container, Row, Col } from 'reactstrap';
import { withLocalize } from 'react-localize-redux';    
/* Components */
import Chat from "./Component/Chat/Chat";
import Sidemenu from "./Component/Sidemenu/Sidemenu";
import Form from "./Component/Control/Form";
import { UrlContext } from './Config/Url';
import store from "./Store/index";

import { uploadFile } from './Actions/Axios'

import UploadModal from "./Component/Control/UploadModal";
/* ---------- */

class App extends React.Component {
    constructor(props){
        super(props);
        this.props.initialize({
            languages: [
              { name: 'English', code: 'en' },
              { name: 'Russian', code: 'ru' }
            ],
            options: {
                renderToStaticMarkup: false,
                renderInnerHtml: true
              }
        });
        this.state = { 
            side: "none",
            target: false,
            hover: false,
            modal: false,
            file: null
        }
        //Event for drag and Drop file on the interface
        this.handleClick = this.handleClick.bind(this);
        this.dropHandler = this.dropHandler.bind(this);
        this.dropTarget = this.dropTarget.bind(this);
        this.dropLeave = this.dropLeave.bind(this);
        this.dropDragEnter = this.dropDragEnter.bind(this);
        this.toggle = this.toggle.bind(this);
    }

    componentDidMount(){
        window.addEventListener('dragover', this.dropTarget);
        window.addEventListener('dragleave', this.dropLeave);
        window.addEventListener('drop', this.dropHandler);
        window.addEventListener('dragenter', this.dropDragEnter);
    }

    componentWillUnmount(){
        window.removeEventListener('drop', this.dropHandler);
        window.removeEventListener('dragover', this.dropTarget);
        window.removeEventListener('dragleave', this.dropLeave);
        window.removeEventListener('dragenter', this.dropDragEnter);
    }

    handleClick(e){
        this.setState({ side: (this.state.side == "block") ? "none" : "block" })
    }

    dropTarget(e){
        e.stopPropagation();
		e.preventDefault();
    }

    dropLeave(e){
        e.stopPropagation();
		e.preventDefault();
        if(e.screenX === 0 && e.screenY === 0) this.setState({ hover: false });
    }

    dropDragEnter(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (!this.state.active) {
          this.setState({
            hover: true
          });
        }
    }

    handleFileDrop(e){
        if(e){
            this.setState({ file: e });
            this.toggle();
        }else{
            this.setState({ hover: false });
        }
    }

    dropHandler(e){     
        e.preventDefault();
        e.stopPropagation();
        let files = e.dataTransfer.files;

        this.setState({
            hover: false
        });

        this.handleFileDrop(files[0]);
    }

    toggle() {
        this.setState({
          modal: !this.state.modal,
        });
    }

    render () {
        return (
            <Container fluid={true} className={(this.state.hover) ? "target" : ""}>
                <Row>
                    <Chat />
                    <UrlContext.Consumer>
                        {url => <Sidemenu {...this.props} show={this.state.side} url={url}/> }
                    </UrlContext.Consumer>
                    <UrlContext.Consumer>
                        {url => <Form {...this.props} url={url}/> }
                    </UrlContext.Consumer>
                </Row>   
                <UploadModal toggle={this.toggle} modal={this.state.modal} file={this.state.file}/>

                /* Button for the side menu on mobile*/
                <div className="openSide" onClick={this.handleClick}><i className="material-icons">keyboard_arrow_down</i></div>
            </Container>   
        );
    }
}

export default withLocalize(App);