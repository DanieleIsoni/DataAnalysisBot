import React from "react";
import { Translate } from 'react-localize-redux';
import { URL_HEROKU } from '../Config/Url';
import store from "../Store/index";
import Upload from '../Component/Control/Upload';

let actions = {
    "initial": [
        {
            name: "Welcome", 
            esempi: [
                { "content": <div className="writable">Hi</div>}, 
                {"content": <div className="writable">Hello</div>}
            ],
        },
        {
            name: "Upload", 
            esempi: [
                {"content": <div>Select the file <br/><Upload url={URL_HEROKU} theme={"side_add"} text={"Upload"} activeVar={store.getState().active}/></div>}, 
                {"content": <div>or drop it on the page</div>}
            ]
        }
    ],
    "after_file": [
        {
            name: <Translate id="ana">Analysis</Translate>, 
            esempi: [
                { "content": <div>I want the <span className="operation">  Operation  </span> of <span className="attribute">  Attribute  </span></div>, "required": ["Operation", "Attribute"], "holder": "I want the %s of %s" }, 
                { "content": <div> Give me the <span className="operation">  Operation  </span> of <span className="attribute">  Attribute  </span></div>, "required": ["Operation", "Attribute"], "holder": "Give me the %s of %s"}, 
                { "content": <div><span className="operation">  Operation  </span> of  <span className="attribute">  Attribute  </span></div>, "required": ["Operation", "Attribute"], "holder": "%s of %s"}
            ]
        },
        {
            name: <Translate id="plot">Plotting</Translate>, 
            esempi: [
                {"content": <div>Can you plot the <span className="operation">  Operation  </span> <span className="attribute">  Attribute  </span> by <span className="attribute">  Attribute  </span></div>, "required": ["Operation", "Attribute", "Attribute 2"], "holder": "Can you plot the %s %s by %s"}
            ]
        },
        {
            name:<Translate id="basic">Basic Description</Translate>, 
            esempi: [{"content": <div className="writable">Basic Description</div>}]
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
                {"content": <div>Now the <span className="operation">  Operation  </span></div>, "required": ["Operation"], "holder": "Now the %s"}, 
                {"content": <div>Of the <span className="attribute">  Attribute  </span></div>, "required": ["Attribute"], "holder": "Of the %s"}
            ]
        },
        {
            name: <Translate id="plot">Plotting</Translate>, 
            esempi: [
                {"content": <div>Can you plot the <span className="operation">  Operation  </span> <span className="attribute">  Attribute  </span> by <span className="attribute">  Attribute  </span></div>, "required": ["Operation", "Attribute", "Attribute"], "holder": "Can you plot the %s %s by %s"}
            ]
        }
    ],
    "after_plot": [
        {
            name: <Translate id="ana">Analysis</Translate>, 
            esempi: [ 
                {"content": <div>I want the <span className="operation">  Operation  </span> of <span className="attribute">  Attribute  </span></div>,"required": ["Operation", "Attribute"], "holder": "I want the %s of %s"}, 
                {"content": <div> Give me the <span className="operation">  Operation  </span> of <span className="attribute">  Attribute  </span></div>, "required": ["Operation", "Attribute"], "holder": "Give me the %s of %s"}, 
                {"content": <div><span className="operation">  Operation  </span> of  <span className="attribute">  Attribute  </span></div>, "required": ["Operation", "Attribute"], "holder": "%s of %s"}
            ]
        },
        {
            name: <Translate id="plot">Plotting</Translate>, 
            esempi: [
                {"content": <div>Can you plot the <span className="operation">  Operation  </span> <span className="attribute">  Attribute  </span> by <span className="attribute">  Attribute  </span> </div>, "required": ["Operation", "Attribute", "Attribute 2"], "holder": "Can you plot the %s %s by %s"}
            ]
        },
        {
            name: <Translate id="edit">Edit plot</Translate>, 
            esempi: [
                {"content": <div>Change the color of the label of <span className="axis"> Axis </span> to <span className="color"> Color  </span> </div>, "required": ["Axis", "Color"], "holder": "Change the color of the label of %s to %s"}, 
                {"content": <div>Change the <span className="axis"> Axis  </span> label font to <span className="font"> Font </span></div>, "required": ["Axis", "Font"], "holder": "Change the %s label font to %s"},
                {"content": <div>Change the <span className="axis"> Plot  </span> title to <span className="axis"> Title </span></div>, "required": ["Title"], "holder": "Change the %s title to %s"}
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