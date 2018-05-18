import { combineReducers } from 'redux'
import messaggi from './messaggi'
import variabili from './variabili'
import hints from './hints'

const App = combineReducers({
  messaggi,
  variabili,
  hints
})

export default App;
