import React from "react";
import SyntaxHighlighter from 'react-syntax-highlighter';
import docco from 'react-syntax-highlighter/styles/hljs/xcode'; 
import dark from 'react-syntax-highlighter/styles/hljs/monokai-sublime'; 

const Code = (props) => {
    return <SyntaxHighlighter showLineNumbers={props.line} language='python' style={(props.theme == null) ? docco : dark}>{props.code}</SyntaxHighlighter>;  
}

export default Code;