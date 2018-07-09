import React from "react";
import { Translate } from 'react-localize-redux';
import store from "../Store/index";

let actions = {
    "initial": [
        {
            name: "Welcome", 
            esempi: [
                { "content": <div className="writable">Hi</div>}
            ],
        },
        {
            name: "Upload", 
            esempi: [
                {"content": <div className="upload_sugg">Select or drop the file</div>}
            ]
        }
    ],
    "after_file": [
        {
            name:<Translate id="basic">Basic Description</Translate>, 
            esempi: [{"content": <div className="writable">Basic Description</div>}]
        },
        {
            name: <Translate id="ana">Analysis</Translate>, 
            esempi: [
                { "content": <div> Give me the <span className="operation"> Operation </span> of <span className="attribute"> Attribute </span></div>, "required": ["Operation", "Attribute"], "holder": "Give me the %s of %s"}
            ]
        },
        {
            name: <Translate id="plot">Plotting</Translate>, 
            esempi: [
                {"content": <div>Can you plot the <span className="operation"> Operation </span> <span className="attribute"> Attribute </span> by <span className="attribute"> Attribute </span></div>, "required": ["Operation", "Attribute", "Attribute 2"], "holder": "Can you plot the %s %s by %s"}
            ]
        }
    ],
    "after_analisys": [
        {
            name:<Translate id="basic">Basic Description</Translate>, 
            esempi: [{"content": <div className="writable">Basic Description</div>}] 
        },
        {
            name: <Translate id="ana_cont">Analysis</Translate>, 
            esempi: [
                {"content": <div>Now the <span className="operation"> Operation </span></div>, "required": ["Operation"], "holder": "Now the %s"}, 
                {"content": <div>Of the <span className="attribute">  Attribute  </span></div>, "required": ["Attribute"], "holder": "Of the %s"}
            ]
        },
        {
            name: <Translate id="plot">Plotting</Translate>, 
            esempi: [
                {"content": <div>Can you plot the <span className="operation"> Operation </span> <span className="attribute">  Attribute  </span> by <span className="attribute">  Attribute  </span></div>, "required": ["Operation", "Attribute", "Attribute 2"], "holder": "Can you plot the %s %s by %s"}
            ]
        }
    ],
    "after_plot": [
        {
            name: <Translate id="ana">Analysis</Translate>, 
            esempi: [ 
                {"content": <div> Give me the <span className="operation"> Operation </span> of <span className="attribute">  Attribute  </span></div>, "required": ["Operation", "Attribute"], "holder": "Give me the %s of %s"}
            ]
        },
        {
            name: <Translate id="plot">Plotting</Translate>, 
            esempi: [
                {"content": <div>Can you plot the <span className="operation"> Operation </span> <span className="attribute">  Attribute  </span> by <span className="attribute">  Attribute  </span> </div>, "required": ["Operation", "Attribute", "Attribute 2"], "holder": "Can you plot the %s %s by %s"}
            ]
        },
        {
            name: <Translate id="edit">Edit plot</Translate>, 
            esempi: [
                {"content": <div>Change the color of the label of <span className="axis"> x </span> to <span className="color"> green </span> </div>, "required": ["Axis", "Color"], "holder": "Change the color of the label of %s to %s"}, 
                {"content": <div>Change the <span className="axis"> y </span> label font to <span className="font"> monospace </span></div>, "required": ["Axis", "Font"], "holder": "Change the %s label font to %s"}
            ]
        }
    ]
}

export default actions;

/*  
    Incoming Dialogflow action schema

    input.welcome   
    input.unknown
    data.received
        plot.chart
            plot.chart.fu.label
        data.description.request
        test.request
            test.request.fu.attribute
            test.request.fu.test
*/