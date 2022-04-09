import { useState, useEffect, useRef } from 'react'

import api from '../api'
import Input from './Input'
import images from '../assets/images'
import EditorErrors from './EditorErrors'

import './Editor.css'

const Editor = (props) => {

    if (!props.data) return null

    const [id, setId] = useState(null)
    const [name, setName] = useState('')
    const [ingredients, setIngredients] = useState([])
    const [garnish, setGarnish] = useState('')
    const [method, setMethod] = useState('')
    const [glass, setGlass] = useState('')
    const [source, setSource] = useState('')
    const [info, setInfo] = useState('')

    const [parameters, setParameters] = useState({})
    const [errors, setErrors] = useState(new EditorErrors())

    useEffect(() => {
        const { id, name, ingredients, garnish, method, glass, source, info } = props.data
        const initializedIngredients = ingredients?.map(({ name, amount }) => ({ name: name || '', amount: amount || '' }))

        api.getParameters().then(parameters => {
            if (parameters.error) return console.error(parameters.error)
            setParameters(parameters)

            setId(id || null)
            setName(name || '')
            setIngredients(initializedIngredients || [])
            setGarnish(garnish || '')
            setMethod(method || parameters.methods[0])
            setGlass(glass || parameters.glasses[0])
            setSource(source || '')
            setInfo(info || '')
        })

    }, [])

    const validate = () => {
        const cocktailNameMissing = name === ''
        const ingredientsMissing = ingredients.length === 0
        const ingredientNamesMissing = ingredients.reduce((acc, cur, i) => cur.name === '' ? acc.concat(i) : acc, [])
        return new EditorErrors(cocktailNameMissing, ingredientsMissing, ingredientNamesMissing)
    }

    const save = () => {

        const errors = validate()
        setErrors(errors)
        if (errors.isNotEmpty()) return null

        const cocktail = { id, name, ingredients, garnish, method, glass, source, info }
        console.log('cocktail', cocktail)

        const action = id ? api.updateCocktail : api.createCocktail
        action(cocktail, props.token).then(response => {
            if (response.error) return console.error(response.error)
            props.close(response)
        })
    }

    return (
        <div id='Editor'>
            <div className='window'>
                <h1>{id ? 'Edit Cocktail' : 'Add a new cocktail'}</h1>
                <div className='closeButton' onClick={() => props.close(null)}>X</div>

                <Input text={[name, setName]} label='Name'
                    className={errors.className('cocktailNameMissing')}
                    onFocus={() => setErrors(errors.remove('cocktailNameMissing'))} />
                <IngredientList {...{ ingredients, setIngredients, errors, setErrors }} />
                <Input text={[garnish, setGarnish]} label='Garnish' />
                <div className='GlassImage'>
                    <img src={images[glass]} />
                </div>

                <span className='MethodText'>{method.toUpperCase()}</span>

                <Input dropdown={[glass, setGlass]} options={parameters.glasses} label='Glass' />
                <Input dropdown={[method, setMethod]} options={parameters.methods} label='Method' />
                <Input text={[source, setSource]} label='Source' />
                <Input text={[info, setInfo]} rows={3} label='Info' />
                {errors.messages()}
                <button onClick={save}>Save</button>

            </div>

        </div>
    )
}

const IngredientList = ({ ingredients, setIngredients, errors, setErrors }) => {

    const ref1 = useRef(null)
    const ref2 = useRef(null)

    const update = (index, update) => ingredients.map((ingredient, i) => i === index ? Object.assign({}, ingredient, update) : ingredient)

    const setAmount = (i) => (event) => setIngredients(update(i, { amount: event.target.value }))
    const setName = (i) => (event) => setIngredients(update(i, { name: event.target.value }))

    const onFauxInputFocus = (focusOn) => () => {
        setErrors(errors.remove('ingredientsMissing'))
        setIngredients(ingredients.concat({ amount: '', name: '', focusOn }))
    }

    const onBlur = (event) => {
        if (event.relatedTarget === ref1.current || event.relatedTarget === ref2.current) return undefined
        setIngredients(ingredients.filter(ingredient => ingredient.amount || ingredient.name))
    }

    const classes = 'labeledInput Ingredients' + errors.className('ingredientsMissing')

    const onNameFocus = (i) => () => {
        setErrors(errors.remove('ingredientNamesMissing', i))
    }

    return <label className={classes}>
        Ingredients
        <ul>
            {ingredients.map((ingredient, i) => (
                <li key={`ingredient_${i}`} className='ingredient'>
                    <input type='text'
                        value={ingredient.amount}
                        onChange={setAmount(i)}
                        autoFocus={ingredient.focusOn === 'amount'}
                        onBlur={onBlur}
                        ref={ref1}
                    />
                    <input type='text'
                        value={ingredient.name}
                        onChange={setName(i)}
                        autoFocus={ingredient.focusOn === 'name'}
                        onFocus={onNameFocus(i)}
                        onBlur={onBlur}
                        ref={ref2}
                        className={errors?.ingredientNamesMissing?.includes(i) ? 'ingredientNameError' : ''}
                    />
                </li>))}
            <li className='ingredient'>
                <input type='text' onFocus={onFauxInputFocus('amount')} />
                <input type='text' onFocus={onFauxInputFocus('name')} />
            </li>
        </ul>
    </label>
}

export default Editor