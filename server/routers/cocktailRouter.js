import express from 'express'
import db from '../database.js'
import { authenticate } from '../auth/auth.js'


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

const deleteRequestError = ({ id }) => {
    if (!id || !Number.isInteger(id)) return 'Missing or invalid id'
}

const validate = (req, res, next) => {
    let error
    if (req.method === 'POST') error = postRequestError(req.body)
    if (req.method === 'PUT') error = putRequestError(req.body)
    if (req.method === 'DELETE') error = deleteRequestError(req.body)

    if (error) return res.status(400).send(error)
    next()
}

router.get('/', authenticate, (req, res) => {
    const results = db.prepare('SELECT cocktail_id AS id, c.name, garnish, method, glass, source, info, i.name AS iname, i.amount AS iamount FROM cocktails AS c LEFT JOIN cocktail_ingredients AS i ON c.id = i.cocktail_id WHERE c.owner=?').all(req.user.id)
    let cocktails = []
    results.forEach(result => {
        let cocktail = cocktails.find(cocktail => cocktail.id === result.id)
        if (cocktail) {
            cocktail.ingredients.push({ name: result.iname, amount: result.iamount })
        } else {
            cocktails.push({
                id: result.id,
                name: result.name,
                method: result.method,
                glass: result.glass,
                garnish: result.garnish,
                source: result.source,
                info: result.info,
                ingredients: [{ name: result.iname, amount: result.iamount }]
            })
        }
    })
    res.send(cocktails)
})

router.post('/', authenticate, validate, (req, res) => {
    const { name, glass, method, source, info, ingredients } = req.body
console.log('post', req.body)
    const createCocktail = db.transaction(() => {
        const result = db.prepare('INSERT INTO cocktails (name, glass, method, source, info, owner) values (?,?,?,?,?,?)')
            .run(name, glass, method, source, info, req.user.id)
        ingredients.forEach(ingredient => {
            db.prepare('INSERT INTO cocktail_ingredients (cocktail_id, name, amount) VALUES (?,?,?)')
                .run(result.lastInsertRowid, ingredient.name, ingredient.amount)
        })
        return result.lastInsertRowid
    })

    try {
        const id = createCocktail()
        res.send({ id, name, glass, method, source, info, ingredients })
    } catch (error) {
        console.error(error.message)
        res.status(500).send(error)
    }

    res.send()
})

router.delete('/', authenticate, validate, (req, res) => {
    console.log('DELETE', req.body)
    const deletion = db.transaction(() => {
        db.prepare('DELETE FROM cocktail_ingredients WHERE cocktail_id=?').run(req.body.id)
        db.prepare('DELETE FROM cocktails WHERE id=? AND owner=?').run(req.body.id, req.user.id)
    })
    try {
        deletion()
        res.send()
    } catch (error) {
        console.error(error)
        res.status(500).send(error)
    }
})

router.put('/', authenticate, validate, (req, res) => {
    const { id, name, glass, method, garnish, source, info, ingredients } = req.body

    console.log(req.body)

    const updateTransaction = db.transaction(() => {
        const updated = { id }
        const nonEmptyParameters = Object.entries({ name, glass, method, garnish, source, info })
            .filter(([key, value]) => !!value)
        if (nonEmptyParameters.length > 0) {
            let query = 'UPDATE cocktails SET '
            let params = []
            nonEmptyParameters.forEach(([key, value]) => {
                query += key + '=?, '
                params = params.concat(value)
                updated[key] = value
            })
            query = query.substring(0, query.length - 2) + 'WHERE id=? AND owner=?'
            params = params.concat(id, req.user.id)
            db.prepare(query).run(...params)
        }

        if (ingredients) {
            db.prepare('DELETE FROM cocktail_ingredients WHERE cocktail_id=?').run(id)
            ingredients.forEach(ingredient => {
                db.prepare('INSERT INTO cocktail_ingredients (cocktail_id, name, amount) VALUES (?,?,?)')
                    .run(id, ingredient.name, ingredient.value)
            })

            updated.ingredients = ingredients
        }
        return updated
    })

    try {
        const value = updateTransaction()
        res.send(value)
    } catch (error) {
        console.error(error.message)
        res.status(500).send(error)
    }
})

export default router