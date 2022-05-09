
import { HiChevronDoubleDown, HiChevronDoubleUp } from 'react-icons/hi'

import { useState } from 'react'
import Input from './Input'
import './Search.css'



const Search = ({ search, setSearch }) => {
    const setFromIngredients = (value) => setSearch(Object.assign({}, search, { fromIngredients: value }))

    const setSearchText = (text) => setSearch(Object.assign({}, search, { text }))


    return (
        <div className='Search'>
            <div className='primaryRow'>
                <Input className='searchInput' text={[search.text, setSearchText]} />
            </div>

        </div>
    )
}

export default Search