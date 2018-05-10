import { combineReducers } from 'redux'
import messaggi from './messaggi'
import variabili from './variabili'

const App = combineReducers({
  messaggi,
  variabili
})

export default App;
