import { useState, useEffect, useRef, useContext } from 'react'
import { RiCloseCircleLine } from 'react-icons/ri'

import { Context } from '../../main'
import api from '../../api'
import images from '../../assets/images'
import EditorErrors from './EditorErrors'

// import IngredientList from './IngredientList'

import './Editor.css'

const Editor = () => {
    const [state, setState] = useContext(Context)

    const [isNewCocktail, setIsNewCocktail] = useState(true)
    const [modified, setModified] = useState({})
    const [name, setName] = useState('')
    const [ingredients, setIngredients] = useState([])
    const [garnish, setGarnish] = useState('')
    const [method, setMethod] = useState('')
    const [glass, setGlass] = useState('')
    const [source, setSource] = useState('')
    const [info, setInfo] = useState('')

    const [parameters, setParameters] = useState(null)
    const [errors, setErrors] = useState(new EditorErrors())

    useEffect(async () => {
        const parameters = await api.getParameters()
        if (parameters.error) return console.error(parameters.error)
        setParameters(parameters)
        setGlass(parameters.glasses[0])
        setMethod(parameters.methods[0])
    }, [])

    useEffect(() => {
        const { name, ingredients, garnish, method, glass, source, info } = state.editorCocktail

        setIsNewCocktail(!state.editorCocktail.id)
        setModified({})

        setName(name ?? '')
        setIngredients(ingredients?.map(({ id, amount, name }) => ({ id, amount: amount ?? '', name: name ?? '' })) ?? [])
        setGarnish(garnish ?? '')
        setMethod(method ?? parameters?.methods[0] ?? '')
        setGlass(glass ?? parameters?.glasses[0] ?? '')
        setSource(source ?? '')
        setInfo(info ?? '')

        setErrors(new EditorErrors())

    }, [state.editorCocktail])

    if (!state.showEditor) return null

    const set = (parameter) => {
        let setter
        if (parameter === 'name') setter = setName
        if (parameter === 'garnish') setter = setGarnish
        if (parameter === 'glass') setter = setGlass
        if (parameter === 'method') setter = setMethod
        if (parameter === 'source') setter = setSource
        if (parameter === 'info') setter = setInfo

        return (event) => {
            setModified({ ...modified, [parameter]: true })
            setter(event.target.value)
        }
    }

    const close = () => {
        if (Object.values(modified).includes(true)) {
            const confirmation = {
                heading: 'Confirm discard',
                text: `You have unsaved changes. Do you want to discard the changes?`,
                confirmButtonText: `Discard`,
                onConfirm: () => {
                    setState({ showEditor: false, confirmation: null })
                },
            }
            setState({ confirmation })
        } else {
            setState({ showEditor: false })
        }
    }

    const validate = () => {
        const cocktailNameMissing = name === ''
        const ingredientsMissing = ingredients.length === 0
        const ingredientNamesMissing = ingredients.reduce((acc, cur, i) => cur.name === '' ? acc.concat(i) : acc, [])
        return new EditorErrors(cocktailNameMissing, ingredientsMissing, ingredientNamesMissing)
    }

    const save = async () => {
        const errors = validate()
        setErrors(errors)
        if (errors.isNotEmpty()) return null

        console.log('oldCocktail', state.editorCocktail)
        isNewCocktail ? createCocktail() : updateCocktail()
    }

    const createCocktail = async () => {
        const cocktail = { name, ingredients, glass, method, garnish, source, info }
        const createdCocktail = await api.setCocktail(cocktail, state.user.token)
        if (createdCocktail.error) return console.error(createdCocktail.error)

        const cocktails = state.cocktails.concat(createdCocktail)
        setState({ showEditor: false, cocktails })
    }

    const updateCocktail = async () => {
        console.log('updateCocktail', ingredients)
        const oldCocktail = state.editorCocktail
        const changes = { id: oldCocktail.id }
        if (oldCocktail.name !== name) changes.name = name
        if (oldCocktail.glass !== glass) changes.glass = glass
        if (oldCocktail.method !== method) changes.method = method
        if (oldCocktail.garnish !== garnish) changes.garnish = garnish
        if (oldCocktail.source !== source) changes.source = source
        if (oldCocktail.info !== info) changes.info = info

        const changedIngredients = []
        ingredients.forEach(({ id, amount, name }) => {
            if (id) {
                const { name: oldName = '', amount: oldAmount = '' } = oldCocktail.ingredients.find(ingredient => ingredient.id === id)

                console.log(name, amount, oldName, oldAmount)
                if (name !== oldName || amount !== oldAmount) {
                    changedIngredients.push({ id, amount, name })
                }
            } else {
                // add new ingredient
                changedIngredients.push({ amount, name })
            }
        })
        if (changedIngredients.length > 0) changes.ingredients = changedIngredients

        const result = await api.setCocktail(changes, state.user.token)
        if (result.error) return console.error(updateCocktail.error)
        
        const cocktails = state.cocktails.map(cocktail => cocktail.id === state.editorCocktail.id ? result : cocktail)
        setState({ showEditor: false, cocktails })

    }


    return (
        <div className='Editor Modal'>
            <div className='window'>
                <div className='content'>

                    <div className='topBlock'>
                        <div className='left'>
                            <h1>{isNewCocktail ? 'Add a Cocktail' : 'Edit Cocktail'}</h1>
                            <label className={errors.cocktailNameMissing ? 'Name error' : 'Name'}>
                                Name
                                <input type='text'
                                    value={name}
                                    onChange={set('name')}
                                    onFocus={() => setErrors(errors.remove('cocktailNameMissing'))} />
                            </label>
                        </div>
                        <div className='right'>
                            <img src={images[glass]} />
                            {method.toUpperCase()}
                        </div>

                    </div>

                    <IngredientList ingredients={ingredients}
                        setIngredients={setIngredients}
                        errors={errors}
                        setErrors={setErrors} />
                    <label className='Garnish'>
                        Garnish
                        <input type='text' value={garnish} onChange={set('garnish')} />
                    </label>
                    <div className='dropdowns'>
                        <label className='Glass'>
                            Glass
                            <select value={glass} onChange={set('glass')}>
                                {parameters.glasses.map(glass => <option key={glass} value={glass}>{glass}</option>)}
                            </select>
                        </label>
                        <label className='Method'>
                            Method
                            <select value={method} onChange={set('method')}>
                                {parameters.methods.map(method => <option key={method} value={method}>{method}</option>)}
                            </select>
                        </label>
                    </div>

                    <label className='Source'>
                        Source
                        <input type='text' value={source} onChange={set('source')} />
                    </label>
                    <label className='Info'>
                        Info
                        <textarea value={info} onChange={set('info')} />
                    </label>
                    {errors.messages()}
                    <div className='buttonRow'>
                        <button onClick={close}>Cancel</button>
                        <button onClick={save}>Save</button>
                    </div>


                </div>
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

    return <div className={classes}>
        Ingredients
        <ul>
            {ingredients.map((ingredient, i) => {
                const nameInputClasses = errors?.ingredientNamesMissing?.includes(i)
                    ? ' ingredientNameInput ingredientNameError'
                    : 'ingredientNameInput'
                return <li key={`ingredient_${i}`} className='ingredient'>
                    <div className='ingredientRow'>
                        <input type='text'
                            className='ingredientAmountInput'
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
                            className={nameInputClasses}
                        />
                    </div>

                </li>
            })}
            <li className='ingredient'>
                <div className='ingredientRow'>

                    <input type='text' className='ingredientAmountInput' onFocus={onFauxInputFocus('amount')} />
                    <input type='text' className='ingredientNameInput' onFocus={onFauxInputFocus('name')} />
                </div>
            </li>
        </ul>
    </div>
}

export default Editor