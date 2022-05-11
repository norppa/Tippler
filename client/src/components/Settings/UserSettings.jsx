import { useContext, useState } from 'react'

import { Context } from '../../main'
import api from '../../api'

import localstorage from '../../localstorage'

const UserSettings = () => {
    const [state, setState] = useContext(Context)

    const [editable, setEditable] = useState(null)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const setUsernameEditable = () => {
        setUsername(state.user.username)
        setEditable('username')
    }

    const setPasswordEditable = () => {
        setPassword('')
        setEditable('password')
    }

    const setVisibilityEditable = () => {
        setEditable('visibility')
    }

    const onUsernameChange = (event) => setUsername(event.target.value)
    const onPasswordChange = (event) => setPassword(event.target.value)

    const saveUsername = async () => {
        if (username === state.user.username) return setEditable(null)

        const confirmation = {
            heading: 'Confirm username change',
            text: `Are you sure you want to set your username to ${username}?`,
            confirmButtonText: `Change username`,
            onConfirm: async () => {
                setState({ confirmation: null })
                const response = await api.setUser({ username }, state.user.token)
                if (response.error) return console.error(response.error)
                console.log('success')
                const user = { ...state.user, username }
                localstorage.setUser(user)
                setState({ user })
            },
        }
        setState({ confirmation })
    }

    const savePassword = async () => {
        const confirmation = {
            heading: 'Confirm password change',
            text: `Are you sure you want to set your password to ${password}?`,
            confirmButtonText: `Change password`,
            onConfirm: async () => {
                setState({ confirmation: null })
                const response = await api.setUser({ password }, state.user.token)
                if (response.error) return console.error(response.error)
                console.log('success')
            },
        }
        setState({ confirmation })
    }

    const saveVisibility = async (event) => {
        const visibility = event.target.value
        const confirmation = {
            heading: 'Confirm visibility change',
            text: `Are you sure you want to change your password to ${visibility}?`,
            confirmButtonText: 'Change visibility',
            onConfirm: async () => {
                setState({ confirmation: null })
                const response = await api.setUser({ visibility }, state.user.token)
                if (response.error) return console.error(response.error)
                const user = { ...state.user, visibility }
                localstorage.setUser(user)
                setState({ user })
            }
        }
        setState({ confirmation })
    }

    const saveOnEnter = (event) => {
        if (event.key !== 'Enter') return
        if (editable === 'username') return saveUsername()
        if (editable === 'password') return savePassword()
    }

    const discard = () => {
        setEditable(null)
    }

    const logout = () => {
        const confirmation = {
            heading: 'Confirm sign out',
            text: `Are you sure you want to sign out?`,
            confirmButtonText: `Sign out`,
            onConfirm: async () => {
                localstorage.delUser()
                setState({ confirmation: null, user: null })
            },
        }
        setState({ confirmation })
    }

    const deleteAccount = () => {
        console.log('dontdoit')
        console.log(state.user)
    }

    return <>
        <h2>User</h2>

        <div className='inputContainer'>
            Username
            {editable === 'username'
                ? <input type='text'
                    value={username}
                    onChange={onUsernameChange}
                    onKeyDown={saveOnEnter}
                    onBlur={discard}
                    autoFocus />
                : <div onDoubleClick={setUsernameEditable}>
                    {state.user.username}
                </div>
            }
        </div>

        <div className='inputContainer'>
            Password
            {editable === 'password'
                ? <input type='text'
                    value={password}
                    onChange={onPasswordChange}
                    onKeyDown={saveOnEnter}
                    onBlur={discard}
                    autoFocus />
                : <div onDoubleClick={setPasswordEditable}>
                    *****
                </div>
            }
        </div>

        <div className='inputContainer'>
            Visibility
            {editable === 'visibility'
                ? <select value={state.user.visibility} onChange={saveVisibility}
                    onBlur={discard}>
                    <option value='PRIVATE'>PRIVATE</option>
                    <option value='HIDDEN'>HIDDEN</option>
                    <option value='PUBLIC'>PUBLIC</option>
                </select>
                : <div onDoubleClick={setVisibilityEditable}>
                    {state.user.visibility}
                </div>
            }
        </div>

        <div>

            <button onClick={deleteAccount}>Delete Account</button>
            <button onClick={logout}>Sign out</button>

        </div>
    </>
}

export default UserSettings