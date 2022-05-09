import { useState, useEffect, useRef, useContext } from 'react'
import { RiCloseCircleLine } from 'react-icons/ri'

import { Context } from '../main'
import api from '../api'
import Input from './Input'
import images from '../assets/images'
import EditorErrors from './EditorErrors'

import './Editor.css'

const Editor = () => {
    const [state, setState] = useContext(Context)

    const [isNewCocktail, setIsNewCocktail] = useState(true)
    const [modified, setModified] = useState(false)
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
        setModified(false)

        setName(name ?? '')
        setIngredients(ingredients ?? [])
        setGarnish(garnish ?? '')
        setMethod(method ?? parameters?.methods[0] ?? '')
        setGlass(glass ?? parameters?.glasses[0] ?? '')
        setSource(source ?? '')
        setInfo(info ?? '')

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
            setModified(true)
            setter(event.target.value)
        }
    }

    const close = () => {
        console.log('modified')
        if (modified) {
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

        const editorCocktail = { id: state.editorCocktail.id, name, ingredients, garnish, method, glass, source, info }
        console.log('cocktail', editorCocktail)

        const response = await api.setCocktail(editorCocktail, state.user.token)
        if (response.error) return console.error(response.error)
        console.log('response', response)

        const cocktails = isNewCocktail
            ? state.cocktails.concat(response)
            : state.cocktails.map(cocktail => cocktail.id === state.editorCocktail.id ? response : cocktail)

        setState({ showEditor: false, cocktails })

    }


    return (
        <div className='Editor Modal'>
            <div className='window'>
                <RiCloseCircleLine className='close' onClick={close} />
                <div className='content'>
                    <h1>{isNewCocktail ? 'Add a Cocktail' : 'Edit Cocktail'}</h1>
                    <label className='Name'>
                        Name
                        <input type='text' value={name} onChange={set('name')} autoFocus />
                    </label>
                    <IngredientList ingredients={ingredients}
                        setIngredients={setIngredients}
                        errors={errors}
                        setErrors={setErrors} />
                    <label className='Garnish'>
                        Garnish
                        <input type='text' value={garnish} onChange={set('garnish')} />
                    </label>
                    <div className='GlassImage'>
                        <img src={images[glass]} />
                    </div>
                    <div className='MethodText'>
                        {method.toUpperCase()}
                    </div>
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
                    <label className='Source'>
                        Source
                        <input type='text' value={source} onChange={set('source')} />
                    </label>
                    <label className='Info'>
                        Info
                        <textarea value={info} onChange={set('info')} />
                    </label>
                    {errors.messages()}
                    <button onClick={save}>Save</button>

                    {/* <Input dropdown={[glass, setGlass]} options={parameters.glasses} label='Glass' /> */}
                    {/* <Input dropdown={[method, setMethod]} options={parameters.methods} label='Method' /> */}
                    {/* <Input text={[source, setSource]} label='Source' /> */}
                    {/* <Input text={[info, setInfo]} rows={3} label='Info' /> */}
                    {/* {errors.messages()} */}
                    {/* <button onClick={save}>Save</button> */}
                </div>
            </div>

        </div>
    )
}

const Editor2 = (props) => {
    const [state, setState] = useContext(Context)

    // const [id, setId] = useState(null)
    // const [name, setName] = useState('')
    // const [ingredients, setIngredients] = useState([])
    // const [garnish, setGarnish] = useState('')
    // const [method, setMethod] = useState('')
    // const [glass, setGlass] = useState('')
    // const [source, setSource] = useState('')
    // const [info, setInfo] = useState('')

    // const [parameters, setParameters] = useState({})
    // const [errors, setErrors] = useState(new EditorErrors())



    if (!state.showEditor) return null

    useEffect(() => {
        // const { id, name, ingredients, garnish, method, glass, source, info } = props.data
        // const initializedIngredients = ingredients?.map(({ name, amount }) => ({ name: name || '', amount: amount || '' }))

        // api.getParameters().then(parameters => {
        //     if (parameters.error) return console.error(parameters.error)
        //     setParameters(parameters)

        //     setId(id || null)
        //     setName(name || '')
        //     setIngredients(initializedIngredients || [])
        //     setGarnish(garnish || '')
        //     setMethod(method || parameters.methods[0])
        //     setGlass(glass || parameters.glasses[0])
        //     setSource(source || '')
        //     setInfo(info || '')
        // })

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

    const close = () => console.log('close')

    return (
        <div className='Editor Modal'>
            <div className='window'>
                <RiCloseCircleLine className='close' onClick={close} />
                <div className='content'>
                    <h1>foobar</h1>
                    {/* <h1>{id ? 'Edit Cocktail' : 'Add a new cocktail'}</h1> */}
                    {/* <Input text={[name, setName]} label='Name'
                        className={errors.className('cocktailNameMissing')}
                        onFocus={() => setErrors(errors.remove('cocktailNameMissing'))} /> */}
                    {/* <IngredientList {...{ ingredients, setIngredients, errors, setErrors }} /> */}
                    {/* <Input text={[garnish, setGarnish]} label='Garnish' /> */}
                    {/* <div className='GlassImage'>
                        <img src={images[glass]} />
                    </div> */}

                    {/* <span className='MethodText'>{method.toUpperCase()}</span> */}

                    {/* <Input dropdown={[glass, setGlass]} options={parameters.glasses} label='Glass' /> */}
                    {/* <Input dropdown={[method, setMethod]} options={parameters.methods} label='Method' /> */}
                    {/* <Input text={[source, setSource]} label='Source' /> */}
                    {/* <Input text={[info, setInfo]} rows={3} label='Info' /> */}
                    {/* {errors.messages()} */}
                    {/* <button onClick={save}>Save</button> */}
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