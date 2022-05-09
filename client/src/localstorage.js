const KEY_USER = '@TipplerUser'

const localstorage = {
    getUser: () => {
        return JSON.parse(localStorage.getItem(KEY_USER))
    },
    setUser: (user) => {
        localStorage.setItem(KEY_USER, JSON.stringify(user))
    },
    delUser: () => {
        localStorage.removeItem(KEY_USER)
    }
}

export default localstorage