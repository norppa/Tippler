import { useContext, useEffect, useState } from 'react'
import { RiCloseCircleLine, RiCheckboxBlankLine, RiCheckboxFill, RiAddBoxLine } from 'react-icons/ri'

import { Context } from '../main'
import api from '../api'

import './Settings.css'
import localstorage from '../localstorage'


const Settings = () => {
    const [state, setState] = useContext(Context)

    const [editable, setEditable] = useState(null)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showCohortInput, setShowCohortInput] = useState(false)
    const [cohortInput, setCohortInput] = useState('')
    const [cohortInputError, setCohortInputError] = useState('')

    if (!state.showSettings) return null

    const close = () => setState({ showSettings: false })

    const setUsernameEditable = () => {
        setUsername(state.user.username)
        setEditable('username')
    }

    const setPasswordEditable = () => {
        setPassword('')
        setEditable('password')
    }

    const setVisibilityEditable = () => {
        setVisibility(state.user.visibility)
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

    const isIncluded = (id) => state.user.cohorts.find(cohort => cohort.id === id)?.included

    const toggleCohort = (id) => async (event) => {
        const included = !isIncluded(id)
        const response = await api.setCohort(id, included, state.user.token)
        const user = { ...state.user, cohorts: state.user.cohorts.map(cohort => cohort.id === id ? { ...cohort, included } : cohort) }
        setState({ user })
    }

    const onCohortInputChange = (event) => {
        setCohortInputError('')
        setCohortInput(event.target.value)
    }

    const onCohortInputEnter = async (event) => {
        if (event.key === 'Enter') {
            const cohort = await api.addCohort(cohortInput, state.user.token)
            console.log('cohort', cohort)
            if (cohort.error === 'USER_NOT_FOUND') return setCohortInputError(`User ${cohortInput} was not found`)
            const user = { ...state.user, cohorts: state.user.cohorts.concat(cohort) }
            localstorage.setUser(user)
            setState({ user })
            setShowCohortInput(false)
            console.log('cohort', cohort)
        }
    }

    return (
        <div className='Settings Modal'>
            <div className='window'>
                <RiCloseCircleLine className='close' onClick={close} />
                <h1>Settings</h1>

                <h2>Search</h2>

                <h2>Cohorts</h2>


                <Checkbox checked={isIncluded(state.user.id)} toggle={toggleCohort(state.user.id)}>
                    <b>My Cocktails</b>
                </Checkbox>

                <Checkbox checked={isIncluded(1)} toggle={toggleCohort(1)}>
                    Tippler Cocktails
                </Checkbox>

                {state.user.cohorts.filter(cohort => cohort.id !== 1 && cohort.id !== state.user.id)
                    .map(cohort => <Checkbox checked={isIncluded(cohort.id)} toggle={toggleCohort(cohort.id)}>{cohort.username}</Checkbox>)}



                {showCohortInput
                    ? <div className='inputContainer'>
                        Add a new cohort
                        <input type='text'
                            value={cohortInput}
                            onChange={onCohortInputChange}
                            onKeyDown={onCohortInputEnter}
                            onBlur={() => setShowCohortInput(false)}
                            autoFocus />

                        <span className='cohortInputError'>{cohortInputError}</span>
                    </div>
                    : <RiAddBoxLine onClick={() => setShowCohortInput(true)} />
                }

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
            </div>

        </div>
    )
}

const Checkbox = ({ checked, toggle, children }) => {

    return <div className='checkbox'>
        {checked
            ? <RiCheckboxFill className='icon' onClick={toggle} />
            : <RiCheckboxBlankLine className='icon' onClick={toggle} />}
        {children}
    </div >
}

export default Settings