import { useState, useEffect, useContext } from 'react'

import { Context } from '../main'
import api from '../api'

import './ContextMenu.css'

const ContextMenu = () => {
    const [state, setState] = useContext(Context)

    const [visible, setVisible] = useState(false)
    const [x, setX] = useState(0)
    const [y, setY] = useState(0)
    const [cocktailId, setCocktailId] = useState(0)
    const [isOwnedByUser, setIsOwnedByUser] = useState(false)

    useEffect(() => {
        document.addEventListener('contextmenu', openContextMenu)
        document.addEventListener('click', closeContextMenu)
        return () => {
            document.removeEventListener('contextmenu', openContextMenu)
            document.removeEventListener('click', closeContextMenu)
        }
    }, [])

    const openContextMenu = (event) => {
        event.preventDefault()
        const card = event.target.closest('.Card')
        setCocktailId(card ? Number(card.dataset.cocktailId) : null)
        setIsOwnedByUser(!card.className.includes('external'))
        setVisible(true)
        setX(event.pageX)
        setY(event.pageY)
    }

    const closeContextMenu = (event) => {
        const menu = document.getElementById('ContextMenu')
        if (menu && !menu.contains(event.target)) {
            setVisible(false)
        }
    }

    if (!visible) return null

    const onDeleteClick = () => {
        console.log('onDeleteClick', state.cocktails, cocktailId)
        const name = state.cocktails.find(cocktail => cocktail.id == cocktailId).name
        const confirmation = {
            heading: 'Confirm delete',
            text: `Are you sure you want to delete "${name}?`,
            confirmButtonText: `Delete`,
            onConfirm: async () => {
                setState({ confirmation: null })
                const response = await api.delCocktail(cocktailId, state.token)
                if (response.error) return console.error(response.error)
                setState({ cocktails: state.cocktails.filter(cocktail => cocktail.id !== cocktailId) })

            },
        }
        setState({ confirmation })
        setVisible(false)
    }

    const onAddNewClick = () => {
        setVisible(false)
        setState({ showEditor: true, editorCocktail: {} })
    }

    const onEditClick = () => {
        const cocktail = state.cocktails.find(cocktail => cocktail.id === cocktailId)
        setVisible(false)
        setState({ showEditor: true, editorCocktail: cocktail})
    }

    return (
        <div id='ContextMenu' style={{ top: y, left: x }}>
            <div className='item' onClick={onAddNewClick}>Add new cocktail </div>
            {isOwnedByUser && <div className='item' onClick={onEditClick}>Edit Cocktail</div>}
            {isOwnedByUser && <div className='item' onClick={onDeleteClick}>Delete Cocktail</div>}
            {(!isOwnedByUser && cocktailId) && <div className='item'>Copy to My Cocktails</div>}

        </div>
    )
}

export default ContextMenu