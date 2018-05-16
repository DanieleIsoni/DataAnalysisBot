import React from "react";
import SyntaxHighlighter from 'react-syntax-highlighter';
import docco from 'react-syntax-highlighter/styles/hljs/atom-one-light'; 

const Code = (props) => {
    const codeString = '' + props.code;
    return <SyntaxHighlighter showLineNumbers='true' language='python' style={docco}>{codeString}</SyntaxHighlighter>;  
}

export default Code;