import express from 'express'
import crypto from 'crypto'
import { generateToken, authenticate } from '../auth.js'
import db from '../db.js'

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

    const registerTransaction = db.transaction(() => {
        const createUserResult = db.prepare('INSERT INTO users (username, salt, hash) VALUES (?,?,?)').run(username, salt, hash)
        const userId = createUserResult.lastInsertRowid
        const cohorts = [{ id: 1, included: true }, { id: userId, included: true }]
        cohorts.forEach(cohort => {
            db.prepare('INSERT INTO cohorts (user, cohort, included) VALUES (?,?,?)').run(userId, cohort.id, cohort.included)
        })

        return { id: result.lastInsertRowid, username, visiblity: 'HIDDEN', cohorts, token }
    })

    try {
        const user = registerTransaction()
        res.send(user)
    } catch (error) {
        res.status(500).send('DATABASE_ERROR')
    }

})

router.post('/login', (req, res) => {
    console.log('/login')
    const { username, password } = req.body
    if (!username) return res.status(400).send('MISSING_USERNAME')
    if (!password) return res.status(400).send('MISSING_PASSWORD')

    const user = db.prepare('SELECT id, username, salt, hash, visibility FROM users WHERE username=?').get(username)
    if (!user) return res.status(401).send('INVALID_USERNAME_OR_PASSWORD')

    const passwordMatchesHash = crypto.pbkdf2Sync(password, user.salt, iterations, keylen, digest).toString('hex') === user.hash
    if (!passwordMatchesHash) return res.status(401).send('INVALID_USERNAME_OR_PASSWORD')

    const cohorts = db.prepare('SELECT cohort, username, included FROM cohorts LEFT JOIN users ON cohorts.cohort = users.id WHERE cohorts.user=?').all(user.id)
        .map(row => ({ id: row.cohort, username: row.username, included: !!row.included }))

    const token = generateToken({ id: user.id })
    res.send({ id: user.id, username: user.username, visibility: user.visibility, cohorts, token })
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
    res.send({ id: req.user.id, username, visibility })

})

router.delete('/', authenticate, (req, res) => {
    const result = db.prepare('DELETE FROM users WHERE id=?').run(req.user.id)
    if (result.changes !== 1) return res.status(500).send('Database error')
    res.send()
})

router.get('/cohort/:id',)

router.post('/cohort', authenticate, (req, res) => {
    const { username } = req.body
    if (!username) return res.status(400).send('MISSING_USERNAME')
    const user = db.prepare('SELECT id, username FROM users WHERE username=? AND visibility IN (?,?)').get(username, 'PUBLIC', 'HIDDEN')
    if (!user) return res.status(400).send('USER_NOT_FOUND')
    const result = db.prepare('INSERT INTO cohorts (user, cohort, included) VALUES (?,?,?)').run(req.user.id, user.id, 1)
    if (result.changes !== 1) return res.status(500).send('DATABASE_ERROR')
    res.send({ id: user.id, username: user.username, included: true })
})

router.put('/cohort', authenticate, (req, res) => {
    if (!req.body.id) return res.status(400).send('MISSING_ID')
    db.prepare('UPDATE cohorts SET included=? WHERE cohort=? AND user=?').run(Number(req.body.included), req.body.id, req.user.id)
    res.send({})
})

router.delete('/cohort', authenticate, (req, res) => {
    if (!req.body.id) return res.status(400).send('MISSING_ID')
    db.prepare('DELETE FROM cohorts WHERE user=? AND cohort=?').run(req.user.id, req.body.id)
    res.send({})
})

const isInvalidVisibility = (visibility) => visibility && !['PRIVATE', 'HIDDEN', 'PUBLIC'].includes(visibility)
const isInvalidUsername = (username) => username && username instanceof String
const isInvalidPassword = (password) => password && username instanceof String

export default router