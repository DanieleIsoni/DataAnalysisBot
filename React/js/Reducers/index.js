import { combineReducers } from 'redux'
import messages from './messages'
import datasets from './datasets'
import hints from './hints'
import active from './active_dataset'

const App = combineReducers({
  messages,
  datasets,
  hints,
  active
})

export default App;
