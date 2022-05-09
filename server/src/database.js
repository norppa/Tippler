import Database from 'better-sqlite3'

const address = {
    'production': './databases/tippler.db',
    'development': './db/tippler.db'
}

export default new Database(address[process.env.NODE_ENV])