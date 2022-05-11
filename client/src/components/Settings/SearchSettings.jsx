import { useContext } from 'react'
import { RiRadioButtonLine, RiCheckboxBlankCircleLine } from 'react-icons/ri'

import { Context } from '../../main'

const SearchSettings = () => {

    return <>
        <h2>Search</h2>
        <SearchDepthRadio value={0}>
            Search only from the titles
        </SearchDepthRadio>

        <SearchDepthRadio value={1}>
            Search titles and ingredients
        </SearchDepthRadio>

        <SearchDepthRadio value={2}>
            Search everything
        </SearchDepthRadio>
    </>
}

const SearchDepthRadio = ({ value, children }) => {
    const [state, setState] = useContext(Context)

    const setSearchDepth = () => setState({ searchDepth: value })

    const Icon = state.searchDepth === value ? RiRadioButtonLine : RiCheckboxBlankCircleLine

    return <div className='radio'>
        <Icon className='icon' onClick={setSearchDepth} />
        {children}
    </div >
}

export default SearchSettings