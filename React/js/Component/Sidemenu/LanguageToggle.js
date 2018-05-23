import React from 'react';
import { withLocalize } from 'react-localize-redux';

const LanguageToggle = ({languages, activeLanguage, setActiveLanguage}) => (
  <div className="switch">
    <input id="language-toggle" className="check-toggle check-toggle-round-flat" type="checkbox" onClick={() => {(activeLanguage.code == 'en') ? setActiveLanguage('ru') : setActiveLanguage('en')}}/>
    <label htmlFor="language-toggle"></label>
    <span className="on">EN</span>
    <span className="off">RU</span>
  </div>
);

export default withLocalize(LanguageToggle);