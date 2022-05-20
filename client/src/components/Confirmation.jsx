import { useContext } from 'react'

import { Context } from '../main'
import './Confirmation.css'

const Confirmation = () => {
    const [state, setState] = useContext(Context)

    if (!state.confirmation) return null

    const { heading, text, confirmButtonText, onConfirm } = state.confirmation

    const cancel = () => {
        setState({ ...state, confirmation: null })
    }

    return <div className='Confirmation Modal'>
        <div className='content'>
            <h3>{heading}</h3>
            <p>{text}</p>

            <div className='buttonRow'>
                <button className='cancelBtn' onClick={cancel}>Cancel</button>
                <button className='confirmBtn' onClick={onConfirm}>{confirmButtonText}</button>
            </div>
        </div>

    </div>
}

export default Confirmation