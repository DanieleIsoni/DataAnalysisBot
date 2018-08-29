import React from "react";
import Choices from '../Choices/Choices';
import { UrlContext } from '../../../Config/Url';
import { Link, Element , Events, animateScroll as scroll, scrollSpy, scroller } from 'react-scroll'

class Output extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            activeOutput: "none",
            activeContent: ''
        }
        this.toggleOutput = this.toggleOutput.bind(this);
    }

    toggleOutput (e, content, name) {
        this.setState({
            activeOutput: (this.state.activeOutput == "none" || this.state.activeOutput != name) ? name : "none",
            activeContent: content
        }, () => {
            this.scrollToBasic();
        })
    }

    scrollToBasic(){ 
        scroller.scrollTo('afterbasic', {
            duration: 500,
            smooth: true,
            containerId: 'scroll'
        }); 
    }

    render () { 
        return (
            (typeof this.props.output != "undefined" && this.props.output != null && this.props.output.length > 0) ?
                <div className="output-area">
                    {
                        this.props.output.map((al, i) => {
                            return(
                                <div className="resultdiv" key={i}>
                                    {

                                        /*
                                             Plot output with the image
                                        */
                                        (al.type == "image/png" && al.content != "define") ?
                                            <div>
                                                <img className="plot_img" src={"data:image/gif;base64," + al.content}/> 
                                                <UrlContext.Consumer>
                                                    {url => <Choices image={al.content} url={url} title={al.title}/>}
                                                </UrlContext.Consumer>
                                            </div>

                                        :

                                        /*
                                               Normal output or basic description handler
                                         */
                                        (typeof this.props.output != "undefined" && this.props.output != null && this.props.output.length > 3) ? 
                                            <div style={{paddingTop: '10px', marginBottom: '5px'}}>
                                                {(i==0) ? <a className="split_basic attributes_label">Attributes: </a> : ''}
                                                <a className="split_basic" onClick={(e) => this.toggleOutput(e, al.content, al.content.split("\n")[0])}>{al.content.split("\n")[0]}</a>
                                            </div>
                                            : 
                                            <pre>{(al.content == "define") ? "Grafico non generato!" : al.content}</pre>
                                    }
                                </div>
                            );
                        })
                    }
                    <div className="container-basic">
                        {(this.state.activeOutput != "none") ? <pre>{this.state.activeContent}</pre> : ''}
                        <Element name="afterbasic"></Element>  
                    </div>
                </div>
            :
            ""
        );
    }
}

export default Output;