import React from "react";
import Choices from '../Choices/Choices';
import { UrlContext } from '../../../Config/Url';

const Output = ({ output, n, messaggi }) => {
    return (
        (typeof output != "undefined" && output != null && output.length > 0) ?
            <div className="output-area">
                <span className="outcode">Out [ {n} ]: </span>
                {
                    output.map((al, i) => {
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
                                    <pre>{(al.content == "define") ? "Grafico non generato!" : al.content}</pre>
                                }
                            </div>
                        );
                    })
                }
            </div>
        :
        ""
    );
}

export default Output;