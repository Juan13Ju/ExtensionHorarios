const btnBuscar = document.getElementById("btnBuscar");

/*
Esta es la funcion que se ejecuta cuando recibes las materias del content script (content.js),
es un arreglo de objetos. 
*/
function mostrarMaterias(materias){
    console.log("Recibi: ", materias);
    let resultsDiv = document.getElementById("results");
    resultsDiv.replaceChildren();
    if(materias.length == 0){
        let noResults = document.createElement("h2");
        noResults.innerText = "No se encontraron materias en ese horario:(";
        resultsDiv.appendChild(noResults);
        return;
    }

    // Por cada resultado, creamos una tabla y la añadimos al popup
    for(m in materias){
        let nombreMateria = materias[m].nombreMateria;
        let titulo = document.createElement("h2");
        titulo.innerText = nombreMateria;
        resultsDiv.appendChild(titulo);
        for(c in materias[m].validas){
            let newTable = document.createElement("table");
            newTable.innerHTML = materias[m].validas[c];
            resultsDiv.appendChild(newTable);
            resultsDiv.appendChild(document.createElement("hr"));
        }
    }
}

btnBuscar.addEventListener("click", () => {
    let hora = document.getElementById("horario").value;
    results.replaceChildren();
    const res = document.createElement("h3");
    res.innerHTML = "Buscando...";
    results.appendChild(res);

    // Enviamos un mensaje al content script para que recupere las materias
    // que coincidan con el horario seleccionado
    chrome.tabs.query({currentWindow : true, active : true}, function(tabs){
        let activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {hora}, mostrarMaterias);
    });

});

