
const UnlabeledInput = (props) => {

    if (props.text && props.rows) {
        const [value, setter] = props.text
        return <textarea value={value}
            onChange={(event) => setter(event.target.value)}
            rows={props.rows}
            className={props.className}
        />
    }

    if (props.text) {
        const [value, setter] = props.text
        return <input type='text'
            value={value}
            onChange={(event) => setter(event.target.value)}
            onFocus={props.onFocus}
            className={props.className}
            disabled={props.disabled}
        />
    }

    if (props.dropdown) {
        if (!props.options) return null
        const [value, setter] = props.dropdown
        return <select value={value}
            onChange={(event) => setter(event.target.value)}
            className={props.className}>
            {props.options.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
    }

    if (props.checkbox) {
        const [value, setter] = props.checkbox
        return <input type='checkbox'
            checked={value}
            onChange={() => setter(!value)}
            className={props.className} />
    }

    console.error('Invalid input parameters', props)
    return null

}

const Input = (props) => {

    if (props.label) {
        const { className, ...rest } = props
        const classes = ['labeledInput', props.label, props.className].join(' ')

        return <label className={classes}>
            <div>{props.label}</div>
            <UnlabeledInput {...rest} />
        </label>
    } else {
        const classes = props.className || props.label
        return <UnlabeledInput {...props} />
    }
}

export default Input