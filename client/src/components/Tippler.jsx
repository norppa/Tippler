import { useContext, useEffect, useState } from 'react'

import { BiCog } from 'react-icons/bi'

import { Context } from '../main'
import api from '../api'
import Card from './Card'
import Search from './Search'
import ContextMenu from './ContextMenu'
import Editor from './Editor'
import Settings from './Settings'

import './Tippler.css'
import Confirmation from './Confirmation'


const Tippler = () => {

    const [state, setState] = useContext(Context)

    const [error, setError] = useState('')
    const [search, setSearch] = useState({ text: '', fromIngredients: false })

    useEffect(async () => {
        const cocktails = await api.getCocktails(state.user.token)
        if (cocktails.error) return setError(cocktails.error)
        setState({ cocktails })
    }, [])


    const matchesSearch = (target) => target.toLowerCase().includes(search.text.toLowerCase())

    const openSettings = () => setState({ showSettings: true })

    console.log('state', state.user.cohorts)

    return (
        <>
            <div className='Tippler'>
                <div className='contentArea'>
                    <div className='TopRow'>
                        <Search search={search} setSearch={setSearch} />
                        <BiCog className='SettingsIcon' onClick={openSettings} />
                    </div>
                    {<div className='error'>{error}</div>}
                    {
                        state.cocktails.filter(cocktail => {
                            if (!search.text) return true
                            if (matchesSearch(cocktail.name)) return true
                            if (search.fromIngredients && cocktail.ingredients.some(ingredient => matchesSearch(ingredient.name))) return true
                        }).map((cocktail) => <Card key={cocktail.id} {...cocktail} />)
                    }
                </div>
            </div>
            <ContextMenu />
            <Editor />
            <Settings />
            <Confirmation />
        </>

    )
}
export default Tippler