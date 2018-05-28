import React from "react";
import { Translate } from 'react-localize-redux';

let actions = {
    "initial": [
        {name: "Welcome", esempi: [<div>Hi</div>, <div>Hello</div>]},
        {name: "Upload", esempi: [<div>Upload file with the button</div>]}
    ],
    "after_file": [
        {name: <Translate id="ana">Analysis</Translate>, esempi: [
                            <div>I want the <span className="operation">  Operation  </span> of <span className="attribute">  Attribute  </span></div>, 
                            <div> Give me the <span className="operation">  Operation  </span> of <span className="attribute">  Attribute  </span></div>, 
                            <div><span className="operation">  Operation  </span> of  <span className="attribute">  Attribute  </span></div>]},
        {name: <Translate id="plot">Plotting</Translate>, esempi: [<div>Can you plot the <span className="operation">  Operation  </span> <span className="attribute">  Attribute  </span> by <span className="attribute">  Attribute  </span> </div>]},
        {name:<Translate id="basic">Basic Description</Translate>, esempi: [<div>Basic Description</div>] }
    ],
    "after_analisys": [
        {name:<Translate id="basic">Basic Description</Translate>, esempi: [<div>Basic Description</div>] },
        {name: <Translate id="ana_cont">Analysis</Translate>, esempi: [<div>Now the <span className="operation">  Operation  </span></div>, <div>Of the <span className="attribute">  Attribute  </span></div>]},
        {name: <Translate id="plot">Plotting</Translate>, esempi: [<div>Can you plot the <span className="operation">  Operation  </span> <span className="attribute">  Attribute  </span> by <span className="attribute">  Attribute  </span></div>]}
    ]
}

export default actions;

/*
    input.welcome   
    input.unknown
    data.received
        plot.chart
        data.description.request
        test.request
            test.request.fu.attribute
            test.request.fu.test


*/