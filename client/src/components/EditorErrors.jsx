class EditorErrors {
    constructor(cocktailNameMissing = false, ingredientsMissing = false, ingredientNamesMissing = []) {
        this.cocktailNameMissing = cocktailNameMissing
        this.ingredientsMissing = ingredientsMissing
        this.ingredientNamesMissing = ingredientNamesMissing
    }

    remove(error, i = null) {
        if (error === 'cocktailNameMissing') {
            return new EditorErrors(false, this.ingredientsMissing, this.ingredientNamesMissing)
        }
        if (error === 'ingredientsMissing') {
            return new EditorErrors(this.cocktailNameMissing, false, this.ingredientNamesMissing)
        }
        if (error === 'ingredientNamesMissing' && typeof i === 'number') {
            return new EditorErrors(this.cocktailNameMissing, false, this.ingredientNamesMissing.filter(x => x !== i))
        }

        throw new Error('invalid EditorError.remove parameters')
    }

    className(error) {
        if (error === 'cocktailNameMissing') return this.cocktailNameMissing ? ' error' : ''
        if (error === 'ingredientsMissing') return this.ingredientsMissing ? ' error' : ''

        throw new Error('invalid EditorError.remove parameters')

    }

    messages() {
        if (!this.cocktailNameMissing && !this.ingredientsMissing && !this.ingredientNamesMissing) return null

        return <div className='Errors'>
            {this.cocktailNameMissing && <div>Every cocktail needs a name</div>}
            {this.ingredientsMissing && <div>Every cocktail needs ingredients</div>}
            {this.ingredientNamesMissing.length > 0 && <div>Every ingredient needs a name</div>}
        </div>
    }

    isNotEmpty() {
        return this.cocktailNameMissing || this.ingredientsMissing || this.ingredientNamesMissing.length > 0
    }

}

export default EditorErrors