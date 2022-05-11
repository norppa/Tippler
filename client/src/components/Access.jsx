
import { useContext, useEffect, useState } from 'react'
import { ImSpinner9 } from 'react-icons/im'

import api from '../api'
import { Context, initialState } from '../main'
import './Access.css'
import localstorage from '../localstorage'


const Access = () => {
    const [state, setState] = useContext(Context)

    const [isLogin, setIsLogin] = useState(true)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => setError(''), [username, password])

    const onUsernameChange = (event) => setUsername(event.target.value)
    const onPasswordChange = (event) => setPassword(event.target.value)
    const submitOnEnter = (event) => event.key === 'Enter' && submit()

    const submit = async () => {
        setError('')
        setIsLoading(true)
        const user = await api.access(username, password, isLogin)
        setIsLoading(false)
        if (user.error) {
            setError(user.error)
        } else {
            setState({ ...initialState, user })
            localstorage.setUser(user)
        }     
    }

    return (
        <div className='Access'>
            <div className='upper'>
                <h1>Tippler</h1>

                <div className='inputs'>
                    <input type='text' placeholder='Username' value={username} onChange={onUsernameChange} disabled={isLoading} />
                    <input type='text' placeholder='Password' value={password} onChange={onPasswordChange} disabled={isLoading} onKeyDown={submitOnEnter} />

                    <button className='submit'
                        onClick={submit}
                        disabled={!password || !username}>
                        {isLoading ? <ImSpinner9 className='spinner' /> : (isLogin ? "Sign in" : "Register")}
                    </button>

                    {error && <div className='error'>{error}</div>}
                </div>

            </div>

            <div className='lower'>
                {isLogin ? 'New to Tippler?' : 'Already have an account?'}
                <a onClick={() => setIsLogin(!isLogin)}>{isLogin ? 'Create an account.' : 'Sign in'}</a>
            </div>
        </div>
    )
}

export default Access