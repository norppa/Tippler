import express from 'express'
import db from '../database.js'
import cocktailRouter from './cocktailRouter.js'
import userRouter from './userRouter.js'

const router = express.Router()
router.use(express.json())

router.get('/', (req, res) => res.send('Tippler Server'))

router.get('/parameters', (req, res) => {
    const glasses = db.prepare('SELECT glass FROM glasses').all().map(obj => obj.glass)
    const methods = db.prepare('SELECT method FROM methods').all().map(obj => obj.method)
    res.send({ glasses, methods })
})

router.use('/user', userRouter)
router.use('/cocktail', cocktailRouter)

export default router