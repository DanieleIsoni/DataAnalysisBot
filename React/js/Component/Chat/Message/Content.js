import React from "react";
import Code from '../Code';

const Message = ({ content, n, isCodeOpen, openCode}) => (
    <div className="m_message">
        <div className="line">
            <div className={content.what}>
                {
                    (content.what == "code") ? 
                        <div className="mycode">
                            <Code code={content.message} line={"false"}/>
                            <span className="code-indicator">Python script <i className="material-icons">code</i></span>
                        </div>
                    :
                    <div className={content.who}>
                        <pre>
                            {content.message}
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
            /*
                Rendering of the code executed if we open it
             */
            (content.id === isCodeOpen) ?
                <div className="line line-code">
                    <Code code={content.code} line="true"/>   
                </div>
            : ''
        }
    </div>
);

export default Message;