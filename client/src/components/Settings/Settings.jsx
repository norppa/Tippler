import { useContext} from 'react'
import { RiCloseCircleLine } from 'react-icons/ri'

import SearchSettings from './SearchSettings'
import CohortSettings from './CohortSettings'
import UserSettings from './UserSettings'
import { Context } from '../../main'

import './Settings.css'

const Settings = () => {
    const [state, setState] = useContext(Context)

    if (!state.showSettings) return null

    const close = () => setState({ showSettings: false })

    return (
        <div className='Settings'>
            <div className='window'>
                <RiCloseCircleLine className='close' onClick={close} />
                <h1>Settings</h1>
                <hr />
                <SearchSettings />    
                <hr />            
                <CohortSettings />
                <hr />
                <UserSettings />
            </div>
        </div>
    )
}

export default Settings