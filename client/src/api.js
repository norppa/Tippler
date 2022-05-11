const apiUrl = process.env.NODE_ENV === 'production' ? 'api' : 'http://localhost:3000/api'

const generateOptions = (method, body, token) => {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            'Accept': 'application/json'
        }
    }

    if (body) options.body = JSON.stringify(body)
    if (token) options.headers['Authorization'] = 'Bearer ' + token

    return options
}

const getParameters = () => {
    const url = apiUrl + '/parameters'
    return fetch(url).then(processResponse)
}

const access = (username, password, isLogin) => {
    const url = apiUrl + (isLogin ? '/user/login' : '/user/register')
    const options = generateOptions('POST', { username, password }, null)
    return fetch(url, options).then(processResponse)
}

const getCocktails = (token) => {
    const url = apiUrl + '/cocktail'
    const options = generateOptions('GET', null, token)
    return fetch(url, options).then(processResponse)
}

const setCocktail = (cocktail, token) => {
    const url = apiUrl + '/cocktail'
    const options = generateOptions(cocktail.id ? 'PUT' : 'POST', cocktail, token)
    return fetch(url, options).then(processResponse)
}

const delCocktail = (id, token) => {
    const url = apiUrl + '/cocktail'
    const options = generateOptions('DELETE', { id }, token)
    console.log('del', url, options)
    return fetch(url, options).then(processResponse)
}

const setUser = (changes, token) => {
    const url = apiUrl + '/user'
    const options = generateOptions('PUT', changes, token)
    return fetch(url, options).then(processResponse)
}

const checkCohort = (username, token) => {
    const url = apiUrl + '/user/cohort'
    const options = generateOptions('POST', { username, probe: true }, token)
    return fetch(url, options).then(processResponse)

}

const addCohort = (username, token) => {
    console.log('addCohort', username, token)
    const url = apiUrl + '/user/cohort'
    const options = generateOptions('POST', { username }, token)
    return fetch(url, options).then(processResponse)
}

const setCohort = (id, included, token) => {
    const url = apiUrl + '/user/cohort'
    const options = generateOptions('PUT', { id, included }, token)
    return fetch(url, options).then(processResponse)
}

const processResponse = async (response) => {
    if (response.status === 200) return await response.json()
    const errorCode = await response.text() ?? unknown
    return { error: errorMessages[errorCode] ?? errorCode }
}

const errorMessages = {
    INVALID_USERNAME_OR_PASSWORD: 'Invalid username or password.',
    SHORT_PASSWORD: 'The password is too short. Please use a longer password.',
    TAKEN_USERNAME: 'The username is taken. Please choose another username.',
    DATABASE_ERROR: 'Server Error. Please try again later.',
    unknown: 'A mysterious error has happened. This should not be possible.'
}

export default { getParameters, access, getCocktails, setCocktail, delCocktail, setUser, checkCohort, setCohort, addCohort }