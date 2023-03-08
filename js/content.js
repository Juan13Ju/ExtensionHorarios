async function generarHorario(links, hora){
    console.log("Hora: ", hora);
    result = []
    for(l in links){

        let html = await getHTML(links[l]).then(text => {return text});
        result = result.concat(obtenerClasesValidas(html, hora));
    }
    return result;
}

async function getHTML(link){
    let response = await fetch(link);
    return await response.text();
}

function obtenerClasesValidas(html, hora){
    // El html de la materia en la que estamos buscando horarios
    let parsedDocument = parser.parseFromString(html, "text/html");
    // Obtenemos los h2 porque en la posicion 9 esta el nombre de la materia
    let h2 = [...parsedDocument.getElementsByTagName("h2")];
    let nombreMateria = h2[9].innerText;
    let tables = [...parsedDocument.getElementsByTagName("table")];
    // Arreglo donde vamos a guardar el texto de las tablas que cumplan con la hora deseada
    let res = {
        nombreMateria,
        validas : []
    }
    // Iteramos sobre las tablas
    for(t in tables){
        let rows = [...tables[t].getElementsByTagName("tr")];
        // Hacemos esto porque hay profesores que no tienen asignado horario y no tienen 4 <td> en <tr>
        for(r in rows){

            let cells = rows[r].getElementsByTagName("td");
            if(cells.length >= 4){
                c = cells[3].innerText.trim();
                if(c.startsWith(hora)){
                    res.validas.push(tables[t].innerHTML);
                }
            }
        }
        
        
    }
    if(res.validas.length == 0){
        return [];
    }
    return res;
}


// DOM parser
const parser = new DOMParser();
// Esperamos el mensaje
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

    
    let links = [...document.getElementsByTagName("a")];
    links = links.map(link => {return link.href});
    links = links.filter(link => {
        return link.includes("/docencia/horarios") && !(link.includes("indiceplan"));
    });
    links.splice(0,4);
    generarHorario(links, msg.hora).then((clases) => {
        sendResponse(clases);
    });
    return true;
});