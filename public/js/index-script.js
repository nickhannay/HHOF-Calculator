const searchForm = document.getElementById('search-form')
searchForm.addEventListener('submit', async (event) => {
        event.preventDefault()
        
        const name = document.getElementById('search-input').value
        console.log(name)
        
        // send name to backend
        const response = await fetch('/searchPlayer', {
                method : 'POST',
                headers: {
                        'Content-Type' : 'application/json'
                },
                body: JSON.stringify({name})
        })

        response.json()
                .then(data => console.log(data))
                .catch((error) => console.log(`no response ----- ${error}`))

})

