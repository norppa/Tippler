import { useContext, useState } from 'react'
import { RiCheckboxBlankLine, RiCheckboxFill, RiAddBoxLine } from 'react-icons/ri'

import { Context } from '../../main'
import api from '../../api'

import localstorage from '../../localstorage'

const CohortSettings = () => {
    const [state, setState] = useContext(Context)

    const [showCohortInput, setShowCohortInput] = useState(false)
    const [cohortInput, setCohortInput] = useState('')
    const [cohortInputError, setCohortInputError] = useState('')

    const isIncluded = (id) => state.user.cohorts.find(cohort => cohort.id === id)?.included

    const toggleCohort = (id) => async (event) => {
        const included = !isIncluded(id)
        const response = await api.setCohort(id, included, state.user.token)
        const user = { ...state.user, cohorts: state.user.cohorts.map(cohort => cohort.id === id ? { ...cohort, included } : cohort) }
        const cocktails = await api.getCocktails(state.user.token)
        if (cocktails.error) return setError(cocktails.error)
        localstorage.setUser(user)
        setState({ user, cocktails })
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

    return <>
        <h2>Cohorts</h2>

        <Checkbox checked={isIncluded(state.user.id)} toggle={toggleCohort(state.user.id)}>
            <b>My Cocktails</b>
        </Checkbox>

        <Checkbox checked={isIncluded(1)} toggle={toggleCohort(1)}>
            Tippler Cocktails
        </Checkbox>

        {state.user.cohorts.filter(cohort => cohort.id !== 1 && cohort.id !== state.user.id)
            .map(cohort => <Checkbox key={`cohort${cohort.id}`} checked={isIncluded(cohort.id)} toggle={toggleCohort(cohort.id)}>{cohort.username}</Checkbox>)}



        {showCohortInput
            ? <div className='inputContainer last'>
                Add a new cohort
                <input type='text'
                    value={cohortInput}
                    onChange={onCohortInputChange}
                    onKeyDown={onCohortInputEnter}
                    onBlur={() => setShowCohortInput(false)}
                    autoFocus />

                {cohortInputError && <span className='cohortInputError'>{cohortInputError}</span>}
            </div>
            : <div className='checkbox last'>
                <RiAddBoxLine className='icon' onClick={() => setShowCohortInput(true)} />
            </div>
        }
    </>
}

const Checkbox = ({ checked, toggle, children }) => {

    return <div className='checkbox'>
        {checked
            ? <RiCheckboxFill className='icon' onClick={toggle} />
            : <RiCheckboxBlankLine className='icon' onClick={toggle} />}
        {children}
    </div >
}

export default CohortSettings