
import { HiChevronDoubleDown, HiChevronDoubleUp } from 'react-icons/hi'

import { useState } from 'react'
import Input from './Input'
import './Search.css'



const Search = ({ search, setSearch }) => {
    const [expanded, setExpanded] = useState(false)

    const setFromIngredients = (value) => setSearch(Object.assign({}, search, { fromIngredients: value }))

    const setSearchText = (text) => setSearch(Object.assign({}, search, { text }))

    const ExpandIcon = expanded ? HiChevronDoubleUp : HiChevronDoubleDown

    return (
        <div className='Search'>
            <div className='primaryRow'>
                <Input className='searchInput' text={[search.text, setSearchText]} />
                <div onClick={() => setExpanded(!expanded)}>
                    <ExpandIcon className='expandIcon'/>
                </div>
            </div>

            {expanded &&
                <div className='extendedRow'>
                    <Input className='searchCheckbox' checkbox={[search.fromIngredients, setFromIngredients]} />
                    Search from from Ingredients
                </div>
            }

        </div>
    )
}

export default Search