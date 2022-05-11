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
        const query = 'SELECT c.id, c.name, c.garnish, c.method, c.glass, c.source, c.info, c.owner, i.name as iname, i.amount as iamount '
            + 'FROM cocktails AS c LEFT JOIN cocktail_ingredients AS i ON c.id = i.cocktail_id '
            + 'WHERE owner IN (SELECT cohort FROM cohorts WHERE user=? AND included=true)'

            console.log('this', this.db)

        const results = this.db.prepare(query).all(userId)
        console.log('result', results)
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
                    ingredients: [{ name: result.iname, amount: result.iamount }],
                    owner: result.owner
                })
            }
        })
        return cocktails
    }
}

export default new Database()