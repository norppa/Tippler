import './ConfirmDelete.css'

const ConfirmDelete = (props) => {
    if (!props.cocktail) return null

    return (
        <div id='ConfirmDelete'>
            <div className='window'>
                <div className='text'>Are you sure you want to delete "{props.cocktail.name}"?</div>

                <div className='buttons'>
                    <button onClick={() => props.close(false)}>Cancel</button>
                    <button onClick={() => props.close(true)}>Delete</button>
                </div>

            </div>
        </div>
    )
}

export default ConfirmDelete