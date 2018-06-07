import { combineReducers } from 'redux'
import messaggi from './messaggi'
import variabili from './variabili'
import hints from './hints'
import active from './active_var'

const App = combineReducers({
  messaggi,
  variabili,
  hints,
  active
})

export default App;
