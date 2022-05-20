import SQLite3Database from 'better-sqlite3'

const address = {
    'production': './databases/tippler.db',
    'development': './db/tippler.db'
}

class Database {

    constructor() {
        this.db = new SQLite3Database(address[process.env.NODE_ENV])
    }

    getCocktails = (userId) => {
        const query = 'SELECT c.id, c.name, c.garnish, c.method, c.glass, c.source, c.info, c.owner, i.id as iid, i.name as iname, i.amount as iamount '
            + 'FROM cocktails AS c LEFT JOIN cocktail_ingredients AS i ON c.id = i.cocktail_id '
            + 'WHERE owner IN (SELECT cohort FROM cohorts WHERE user=? AND included=true)'

        const results = this.db.prepare(query).all(userId)
        let cocktails = []
        results.forEach(result => {
            let cocktail = cocktails.find(cocktail => cocktail.id === result.id)
            if (cocktail) {
                cocktail.ingredients.push({ id: result.iid, name: result.iname, amount: result.iamount })
            } else {
                cocktails.push({
                    id: result.id,
                    name: result.name,
                    method: result.method,
                    glass: result.glass,
                    garnish: result.garnish,
                    source: result.source,
                    info: result.info,
                    ingredients: [{ id: result.iid, name: result.iname, amount: result.iamount }],
                    owner: result.owner
                })
            }
        })
        return cocktails
    }

    addCocktail = (userId, name, ingredients, glass, method, garnish, source, info) => {
        console.log('addCocktail', garnish)
        const createTransaction = this.db.transaction(() => {
            const result = this.db.prepare('INSERT INTO cocktails (name, glass, method, garnish, source, info, owner) values (?,?,?,?,?,?,?)')
                .run(name, glass, method, garnish, source, info, userId)
            ingredients.forEach(ingredient => {
                this.db.prepare('INSERT INTO cocktail_ingredients (cocktail_id, name, amount) VALUES (?,?,?)')
                    .run(result.lastInsertRowid, ingredient.name, ingredient.amount)
            })

            const id = result.lastInsertRowid
            return { id, name, ingredients, glass, method, garnish, source, info, owner: userId }
        })

        return createTransaction()
    }

    setCocktail = (userId, cocktailId, name, ingredients, glass, method, garnish, source, info) => {
        console.log('setCocktail', { cocktailId, name, ingredients, glass, method, garnish, source, info })

        const updateTransaction = this.db.transaction(() => {
            const updated = { id: cocktailId }

            // Update cocktails table
            let query = 'UPDATE cocktails SET '
            let params = []
            Object.entries({ name, glass, method, garnish, source, info })
                .filter(([key, value]) => value !== undefined)
                .forEach(([key, value]) => {
                    const valueString = value ?? ''
                    query += key + '=?, '
                    params = params.concat(valueString)
                    updated[key] = valueString
                })
            query = query.substring(0, query.length - 2) + ' WHERE id=? AND owner=?'
            params = params.concat(cocktailId, userId)
            console.log('query', query)
            console.log('params', params)
            this.db.prepare(query).run(...params)

            // Update cocktail_ingredients table
            if (ingredients) {
                this.db.prepare('DELETE FROM cocktail_ingredients WHERE cocktail_id=?').run(cocktailId)
                ingredients.forEach(ingredient => {
                    this.db.prepare('INSERT INTO cocktail_ingredients (cocktail_id, name, amount) VALUES (?,?,?)')
                        .run(cocktailId, ingredient.name, ingredient.value)
                })

                updated.ingredients = ingredients
            }
            return updated
        })

        return updateTransaction()
    }

    delCocktail = (userId, cocktailId) => {
        this.db.prepare('DELETE FROM cocktails WHERE id=? AND owner=?').run(cocktailId, userId)
    }

    cloneCocktail = (userId, cocktailId) => {
        const cloneTransaction = this.db.transaction(() => {
            const sourceCocktail = this.db
                .prepare('SELECT name, glass, method, garnish, source, info, owner FROM cocktails WHERE id=?')
                .get(cocktailId)
            if (!sourceCocktail) return { error: 'COCKTAIL_NOT_FOUND' }
            const { name, glass, method, garnish, source, info, owner } = sourceCocktail
            const sourceUser = this.db
                .prepare('SELECT visibility from users where id=?')
                .get(owner)
            if (sourceUser.visibility === 'PRIVATE') return { error: 'COCKTAIL_NOT_FOUND' }
            const sourceIngredients = this.db
                .prepare('SELECT name, amount FROM cocktail_ingredients WHERE cocktail_id=?')
                .all(cocktailId)

            const result = this.db
                .prepare('INSERT INTO cocktails (name, glass, method, garnish, source, info, owner) values (?,?,?,?,?,?,?)')
                .run(name, glass, method, garnish, source, info, userId)
            const targetCocktail = { id: result.lastInsertRowid, name, glass, method, garnish, source, info, owner: userId, ingredients: [] }
            sourceIngredients.forEach(({ name, amount }) => {
                const result = this.db
                    .prepare('INSERT INTO cocktail_ingredients (cocktail_id, name, amount) VALUES (?,?,?)')
                    .run(targetCocktail.id, name, amount)
                targetCocktail.ingredients.push({id: result.lastInsertRowid, name, amount})
            })

            return targetCocktail
        })

        return cloneTransaction()
    }
}

export default new Database()