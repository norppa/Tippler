
import { useEffect, useState } from 'react'
import { ImSpinner9 } from 'react-icons/im'

import API from '../api'
import Input from './Input'
import './Access.css'


const Access = ({ login }) => {

    const [isLogin, setIsLogin] = useState(true)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => setError(''), [username, password])

    const submit = () => {
        setError('')
        setIsLoading(true)
        API.access(username, password, isLogin)
            .then(response => {
                if (response.error) setError(response.error)
                else login(response.token)
            })
            .catch(error => {
                console.error(error)
                setError('Error trying to reach the server. Please try again later.')
            })
            .finally(() => setIsLoading(false))
    }

    return (
        <div className='Access'>
            <div className='upper'>
                <h1>{isLogin ? "Sign in to Tippler" : "Register to Tippler"}</h1>

                <div className='inputs'>
                    Username
                    <Input text={[username, setUsername]} disabled={isLoading} />
                    Password
                    <Input text={[password, setPassword]} disabled={isLoading} />

                    <button className='submit'
                        onClick={submit}
                        disabled={!password || !username}>
                        { isLoading ? <ImSpinner9 className='spinner' /> : (isLogin ? "Sign in" : "Register") }
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