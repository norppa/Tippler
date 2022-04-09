import express from 'express'
import crypto from 'crypto'
import { generateToken, authenticate } from '../auth/auth.js'
import db from '../database.js'

const router = express.Router()

const iterations = 10000
const keylen = 64
const digest = 'sha512'

router.use(express.json())

router.post('/register', (req, res) => {
    console.log('/register')
    const { username, password } = req.body
    if (!username) return res.status(400).send('MISSING_USERNAME')
    if (!password) return res.status(400).send('MISSING_PASSWORD')
    if (password.length < 1) return res.status(400).send('SHORT_PASSWORD')

    const existingUser = db.prepare('SELECT id FROM users WHERE username=?').get(username)
    if (existingUser) return res.status(400).send('TAKEN_USERNAME')

    const salt = crypto.randomBytes(32).toString('hex')
    const hash = crypto.pbkdf2Sync(password, salt, iterations, keylen, digest).toString('hex')

    const result = db.prepare('INSERT INTO users (username, salt, hash) VALUES (?,?,?)').run(username, salt, hash)
    if (result.changes !== 1) return res.status(500).send('DATABASE_ERROR')
    const token = generateToken({ username, id: result.lastInsertRowid })
    res.send({ token })
})

router.post('/login', (req, res) => {
    const { username, password } = req.body
    if (!username) return res.status(400).send('MISSING_USERNAME')
    if (!password) return res.status(400).send('MISSING_PASSWORD')

    const user = db.prepare('SELECT * FROM users WHERE username=?').get(username)
    if (!user) return res.status(401).send('INVALID_USERNAME_OR_PASSWORD')

    const passwordMatchesHash = crypto.pbkdf2Sync(password, user.salt, iterations, keylen, digest).toString('hex') === user.hash
    if (!passwordMatchesHash) return res.status(401).send('INVALID_USERNAME_OR_PASSWORD')

    const token = generateToken({ username, id: user.id })
    res.send({ token })
})

router.put('/', authenticate, (req, res) => {
    const { username, password, visibility } = req.body

    if (!username && !password && !visibility) return res.status(400).send('Nothing to update')
    if (isInvalidVisibility(visibility)) return res.status(400).send('Invalidi visibility value')


    const updateTransaction = db.transaction(() => {
        if (username) {
            db.prepare('UPDATE users SET username=? WHERE id=?').run(username, req.user.id)
        }
        if (password) {
            const salt = crypto.randomBytes(32).toString('hex')
            const hash = crypto.pbkdf2Sync(password, salt, iterations, keylen, digest).toString('hex')
            db.prepare('UPDATE users SET salt=?, hash=? WHERE id=?').run(salt, hash, req.user.id)
        }
        if (visibility) {
            db.prepare('UPDATE users SET visibility=? WHERE id=?').run(visibility, req.user.id)
        }
    })

    try {
        updateTransaction()
    } catch (error) {
        return res.status(500).send('Database error')
    }
    res.send({ id: req.user.id, username, password, visibility })

})

router.delete('/', authenticate, (req, res) => {
    const result = db.prepare('DELETE FROM users WHERE id=?').run(req.user.id)
    if (result.changes !== 1) return res.status(500).send('Database error')
    res.send()
})

const isInvalidVisibility = (visibility) => visibility && !['PRIVATE', 'HIDDEN', 'PUBLIC'].includes(visibility)
const isInvalidUsername = (username) => username && username instanceof String
const isInvalidPassword = (password) => password && username instanceof String

export default router