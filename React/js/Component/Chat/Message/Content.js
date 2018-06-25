import React from "react";
import Code from '../Code';

const Message = ({ content, n, isCodeOpen, openCode}) => (
    <div className="m_message">
        <div className="line">
        <span className="incode-markdown">{(content.start != null) ? "" : n}</span>
            <div className={content.what}>
                {
                    (content.what == "code") ? 
                        <div className="mycode">
                            <Code code={content.messaggio} line={"false"}/>
                            <span className="code-indicator">Python script <i className="material-icons">code</i></span>
                        </div>
                    :
                    <div className={content.who}>
                        <pre>
                            {content.messaggio}
                        </pre>
                        <span className="date">{content.date}</span>

                        {
                            (content.code != null) ? 
                                <a className="code_command" onClick={(e) => openCode(e, content.id)}><i className="material-icons">code</i> {(content.id === isCodeOpen) ? " Close" : " View the Code"}</a>
                            : ''
                        }
                    </div>
                }
            </div>
        </div>
        {
            (content.id === isCodeOpen) ?
                <div className="line line-code">
                    <span className="incode">In [ {n} ]: </span>
                    <Code code={content.code} line="true"/>   
                </div>
            : ''
        }
    </div>
);

export default Message;