import React from "react";
import Code from '../Code';

const Message = ({ content, n, isCodeOpen, openCode}) => (
    <div className="m_message">
        <div className="line">
            <span className="incode-markdown">{n}</span>
            <div className={content.what}>
                {
                    (content.what == "code") ? 
                        <Code className="mycode" code={content.messaggio} line={"false"}/>
                    :
                    <div className={content.who}>
                        {content.messaggio}

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
                <div className="line">
                    <span className="incode">In [ {n} ]: </span>
                    <Code code={content.code} line="true"/>   
                </div>
            : ''
        }
    </div>
);

export default Message;