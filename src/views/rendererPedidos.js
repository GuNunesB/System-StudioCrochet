/*api.renderNotes((event, notes) => {
    const renderNotes = JSON.parse(notes)
     arrayNotes = renderNotes
     arrayNotes.forEach((n) => {
        list.innerHTML += `
            <li class="card" style="background-color: var(--${n.cor});">
                <p onclick="deleteNote('${n._id}')" id="x">X</p>
                <p id="code">${n._id}</p>
                <p>${n.texto}</p>
                <p id="color">${n.cor}</p>
            </li>
        `
     })
})*/