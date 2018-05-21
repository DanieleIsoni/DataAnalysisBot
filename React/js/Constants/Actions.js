import React from "react";

let actions = {
    "initial": [
        {name: "Welcome", esempi: [<div>Hi</div>, <div>Hello</div>]},
        {name: "Upload", esempi: [<div>Upload file with the button</div>]}
    ],
    "after_file": [
        {name: "Analisys", esempi: [
                            <div>I want the <span className="operation">  Operation  </span> of <span className="attribute">  Attribute  </span></div>, 
                            <div> Give me the <span className="operation">  Operation  </span> of <span className="attribute">  Attribute  </span></div>, 
                            <div><span className="operation">  Operation  </span> of  <span className="attribute">  Attribute  </span></div>]},
        {name: "Plotting", esempi: [<div>Can you plot the <span className="operation">  Operation  </span> <span className="attribute">  Attribute  </span> by <span className="attribute">  Attribute  </span> </div>]}
    ],
    "after_analisys": [
        {name: "Analisys continuation", esempi: [<div>Now the <span className="operation">  Operation  </span></div>, <div>Of the <span className="attribute">  Attribute  </span></div>]},
        {name: "Plotting", esempi: [<div>Can you plot the <span className="operation">  Operation  </span> <span className="attribute">  Attribute  </span> by <span className="attribute">  Attribute  </span></div>]}
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