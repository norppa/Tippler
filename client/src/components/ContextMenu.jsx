import { useState, useEffect, useRef } from 'react'

import './ContextMenu.css'

const ContextMenu = (props) => {

    const [visible, setVisible] = useState(false)
    const [x, setX] = useState(0)
    const [y, setY] = useState(0)
    const [cocktailId, setCocktailId] = useState(0)

    useEffect(() => {
        document.addEventListener('contextmenu', openContextMenu)
        document.addEventListener('click', closeContextMenu)
    }, [])

    const openContextMenu = (event) => {
        event.preventDefault()
        const card = event.target.closest('.Card')
        setCocktailId(card ? card.dataset.cocktailId : null)
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
        setVisible(false)
        props.setConfirmDelete(cocktailId)
    }

    const onEditNewClick = () => {
        setVisible(false)
        props.openEditor(null)
    }

    const onEditOldClick = () => {
        setVisible(false)
        props.openEditor(cocktailId)
    }

    return (
        <div id='ContextMenu' style={{ top: y, left: x }}>
            <div className='item' onClick={onEditNewClick}>Add new cocktail </div>
            {cocktailId && <div className='item' onClick={onEditOldClick}>Edit Cocktail</div>}
            {cocktailId && <div className='item' onClick={onDeleteClick}>Delete Cocktail</div>}

        </div>
    )
}

export default ContextMenu