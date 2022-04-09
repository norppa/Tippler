import { useEffect, useState } from 'react'

import API from '../api'
import Card from './Card'
import Search from './Search'
import ContextMenu from './ContextMenu'
import Editor from './Editor'
import ConfirmDelete from './ConfirmDelete'

import './Tippler.css'


const Tippler = ({ logout, token }) => {

    const [error, setError] = useState('')
    const [cocktails, setCocktails] = useState([])
    const [search, setSearch] = useState({ text: '', fromIngredients: false })

    const [editor, setEditor] = useState()
    const [confirmDelete, setConfirmDelete] = useState(null)

    useEffect(() => {
        getCocktails()

    }, [])

    const getCocktails = () => API.getCocktails(token)
        .then(response => {
            if (response.error) setError(response.error)
            else setCocktails(response)

            console.log('cocktails', response)
        })

    const matchesSearch = (target) => target.toLowerCase().includes(search.text.toLowerCase())

    const openEditor = (id) => setEditor(id ? cocktails.find(cocktail => cocktail.id == id) : {})

    const closeEditor = (cocktail) => {
        console.log('closeEditor', cocktail)
        setEditor(null)
        if (cocktail) setCocktails(cocktails.concat(cocktail))
    }

    const openConfirmDelete = (id) => {
        const cocktail = cocktails.find(cocktail => cocktail.id === Number(id))
        setConfirmDelete(cocktail)
    }

    const closeConfirmDelete = (confirmed) => {
        if (confirmed) {
            API.deleteCocktail(confirmDelete.id, token).then(response => {
                if (response.status === 200) getCocktails()
                else console.error(response)
            })
        }
        setConfirmDelete(false)
    }

    return (
        <>
            <div className='Tippler'>
                <div className='contentArea'>
                    <Search search={search} setSearch={setSearch} />
                    {
                        cocktails.filter(cocktail => {
                            if (!search.text) return true
                            if (matchesSearch(cocktail.name)) return true
                            if (search.fromIngredients && cocktail.ingredients.some(ingredient => matchesSearch(ingredient.name))) return true
                        }).map((cocktail) => <Card key={cocktail.id} {...cocktail} />)
                    }
                </div>
            </div>
            <ContextMenu setEditor={setEditor} openEditor={openEditor} deleteCocktail={openConfirmDelete} />
            <Editor data={editor} close={closeEditor} token={token} />
            <ConfirmDelete cocktail={confirmDelete} close={closeConfirmDelete} />
        </>

    )
}
export default Tippler