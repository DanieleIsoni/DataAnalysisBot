import React from "react";
import SyntaxHighlighter from 'react-syntax-highlighter';
import docco from 'react-syntax-highlighter/styles/hljs/xcode'; 

const Code = (props) => {
    return <SyntaxHighlighter showLineNumbers='true' language='python' style={docco}>{props.code}</SyntaxHighlighter>;  
}

export default Code;