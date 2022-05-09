import React, { useContext, useEffect, useState, createContext } from 'react'
import ReactDOM from 'react-dom'

import localstorage from './localstorage'
import Access from './components/Access'
import Tippler from './components/Tippler'

import './main.css'

export const initialState = {
  user: null,
  cocktails: [],
  editorCocktail: {},
  showEditor: false,
  showSettings: true,
  settings: {
    includedUsers: []
  }
}

export const Context = createContext(initialState)

const Store = ({ children }) => {
  const [state, _setState] = useState(initialState)
  const setState = (changes) => _setState(Object.assign({}, state, changes))

  return <Context.Provider value={[state, setState]}>{children}</Context.Provider>
}

const App = () => {
  const [state, setState] = useContext(Context)

  useEffect(() => {
    const user = localstorage.getUser()
    if (!user) return



    if (user) setState({ user })
  }, [])

  return state.user ? <Tippler /> : <Access />
}

ReactDOM.render(
  <React.StrictMode>
    <Store>
      <App />
    </Store>
  </React.StrictMode>,
  document.getElementById('root')
)
