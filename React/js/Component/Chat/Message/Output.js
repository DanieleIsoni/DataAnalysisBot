import React from "react";
import Choices from '../Choices/Choices';
import { UrlContext } from '../../../Config/Url';

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
            this.props.scroller();
        })
    }

    render () { 
        return (
            (typeof this.props.output != "undefined" && this.props.output != null && this.props.output.length > 0) ?
                <div className="output-area">
                    <span className="outcode">Out [ {this.props.n} ]: </span>
                    {
                        this.props.output.map((al, i) => {
                            return(
                                <div className="resultdiv" key={i}>
                                    {
                                        (al.type == "image/png" && al.content != "define") ? 
                                            <div>
                                                <img className="plot_img" src={"data:image/gif;base64," + al.content}/> 
                                                <UrlContext.Consumer>
                                                    {url => <Choices image={al.content} url={url} title={al.title}/>}
                                                </UrlContext.Consumer>
                                            </div>
                                        :
                                        (typeof this.props.output != "undefined" && this.props.output != null && this.props.output.length > 3) ? 
                                            <div style={{paddingTop: '10px'}}>
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
                    </div>
                </div>
            :
            ""
        );
    }
}

export default Output;