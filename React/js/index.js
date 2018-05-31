import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import store from "./Store/index";
import { Provider } from "react-redux";
import { LocalizeProvider } from 'react-localize-redux';
import { UrlContext, URL_HEROKU } from './Config/Url';

ReactDOM.render(
    <LocalizeProvider>
        <Provider store={store}>
            <UrlContext.Provider value={URL_HEROKU}>
                <App/>
            </UrlContext.Provider>
        </Provider>
    </LocalizeProvider>,
    document.getElementById("content")
);
