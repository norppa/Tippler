import { useContext, useEffect, useState } from 'react'

import { BiCog } from 'react-icons/bi'

import { Context } from '../main'
import api from '../api'
import Card from './Card'
import ContextMenu from './ContextMenu'
import Editor from './Editor/Editor'
import Settings from './Settings/Settings'

import './Tippler.css'
import Confirmation from './Confirmation'


const Tippler = () => {
    const [state, setState] = useContext(Context)

    const [error, setError] = useState('')

    useEffect(async () => {
        const cocktails = await api.getCocktails(state.user.token)
        if (cocktails.error) return setError(cocktails.error)
        setState({ cocktails })
    }, [])

    const setSearchValue = (event) => setState({ searchValue: event.target.value })

    const matchesSearch = (target) => target?.toLowerCase()?.includes(state.searchValue.toLowerCase())

    const openSettings = () => setState({ showSettings: true })

    const bySearch = ({ name, ingredients, glass, method, garnish, source, info }) => {
        if (!state.searchValue) return true
        if (matchesSearch(name)) return true
        if (state.searchDepth === 0) return false
        if (ingredients.some(({ name }) => matchesSearch(name))) return true
        if (state.searchDepth === 1) return false
        return [glass, method, garnish, source, info].some(x => matchesSearch(x))
    }

    return (
        <>
            <div className='Tippler'>
                <div className='TopRow'>
                    <input className='Search'
                        type='text'
                        value={state.searchValue}
                        onChange={setSearchValue}
                    />
                    <BiCog className='SettingsIcon' onClick={openSettings} />
                </div>
                {<div className='error'>{error}</div>}
                {
                    state.cocktails.filter(bySearch)
                        .map((cocktail) => <Card key={cocktail.id} {...cocktail} />)
                }
            </div>
            <ContextMenu />
            <Editor />
            <Settings />
            <Confirmation />
        </>

    )
}

export default Tippler