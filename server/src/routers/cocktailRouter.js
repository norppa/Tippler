import express from 'express'
import db from '../db.js'
import Database from '../database.js'
import { authenticate } from '../auth.js'


const router = express.Router()

const validMethods = db.prepare('SELECT method FROM methods').all().map(obj => obj.method)
const validGlasses = db.prepare('SELECT glass FROM glasses').all().map(obj => obj.glass)

const postRequestError = ({ name, glass, method, ingredients }) => {
    if (!name) return 'MISSING_NAME'
    if (!glass) return 'MISSING_GLASS'
    if (!method) return 'MISSING_METHOD'
    if (!validMethods.includes(method)) return 'INVALID_METHOD'
    if (!validGlasses.includes(glass)) return 'INVALID_GLASS'
    if (!ingredients || !(ingredients instanceof Array)) return 'MISSING_INGREDIENTS'
    if (ingredients.find(ingredient => !ingredient.name)) return 'INVALID_INGREDIENTS'
}

const putRequestError = ({ id, glass, method, ingredients }) => {
    if (!id || !Number.isInteger(id)) return 'Missing or invalid id'
    if (method && !validMethods.includes(method)) return 'Invalid method'
    if (glass && !validGlasses.includes(glass)) return 'Invalid glass'
    if (ingredients && !(ingredients instanceof Array)) return 'Invalid ingredient list'
    if (ingredients && ingredients.find(ingredient => !ingredient.name)) return 'Invalid ingredient'
}

const validate = (req, res, next) => {
    let error
    if (req.method === 'POST') error = postRequestError(req.body)
    if (req.method === 'PUT') error = putRequestError(req.body)

    if (error) return res.status(400).send(error)
    next()
}

router.get('/', authenticate, (req, res) => {
    res.send(Database.getCocktails(req.user.id))
})

router.post('/', authenticate, validate, (req, res) => {
    console.log('/POST', req.body)
    const { name, ingredients, glass, method, garnish, source, info } = req.body
    try {
        const createdCocktail = Database.addCocktail(req.user.id, name, ingredients, glass, method, garnish, source, info)
        res.send(createdCocktail)
    } catch (error) {
        console.error(error.message)
        res.status(500).send(error)
    }
})

router.delete('/', authenticate, (req, res) => {
    console.log('DELETE', req.body)
    const { id } = req.body
    try {
        Database.delCocktail(req.user.id, id)
        res.send({})
    } catch (error) {
        console.error(error)
        res.status(500).send(error)
    }
})

router.put('/', authenticate, validate, (req, res) => {
    console.log('/PUT', req.body)
    const { id, name, ingredients, glass, method, garnish, source, info } = req.body
    try {
        const changes = Database.setCocktail(req.user.id, id, name, ingredients, glass, method, garnish, source, info)
        res.send(changes)
    } catch (error) {
        console.error(error)
        res.status(500).send(error.message)
    }
})

router.post('/:id', authenticate, (req, res) => {
    console.log('clone cocktail', req.params.id)
    try {
        const clonedCocktail = Database.cloneCocktail(req.user.id, req.params.id)
        if (clonedCocktail.error) res.status(400).send(clonedCocktail.error)
        res.send(clonedCocktail)
    } catch (error) {
        console.error(error)
        res.status(500).send(error.message)
    }
})

export default router