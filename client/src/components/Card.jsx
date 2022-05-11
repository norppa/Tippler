import { useState, useContext } from 'react'

import { Context } from '../main'
import images from '../assets/images'

import './Card.css'

const Card = ({ id, name, glass, method, garnish, source, info, ingredients, owner }) => {
    const [state, setState] = useContext(Context)

    const [isClosed, setIsClosed] = useState(true)

    const toggle = () => setIsClosed(!isClosed)

    const classes = owner === state.user.id ? 'Card' : 'Card external'


    return (
        <div className={classes} data-cocktail-id={id} onClick={toggle}>
            {isClosed
                ? <h2>{name}</h2>
                : <div className='contents'>
                    <h2>{name}</h2>
                    <img className='glass' src={images[glass]} alt={glass} />
                    <span className='method'>{method}</span>
                    <ul className='ingredients'>
                        {ingredients.map(({ amount, name }) => <li key={`${id}${name}`}>{amount} {name}</li>)}
                    </ul>
                    <div className='optional'>
                        {garnish && <div className='garnish'>{garnish}</div>}
                        {info && <div className='info'>{info}</div>}
                        {source && <div className='source'><b>Source:</b> {source}</div>}
                    </div>

                </div>}
        </div>
    )
    }

        export default Card