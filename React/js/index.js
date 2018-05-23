import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import store from "./Store/index";
import { Provider } from "react-redux";
import { LocalizeProvider } from 'react-localize-redux';


ReactDOM.render(
    <LocalizeProvider>
        <Provider store={store}>
            <App/>
        </Provider>
    </LocalizeProvider>,
    document.getElementById("content")
);
