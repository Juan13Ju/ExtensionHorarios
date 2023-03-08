async function generarHorario(links, hora){
    console.log("Hora: ", hora);
    result = []
    for(l in links){
        // Por cada link, obtenemos el html de la pagina a la que nos lleva
        let html = await getHTML(links[l]).then(text => {return text});
        // Ya que tenemos el html, nos fijamos si contiene algun horario valido
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
    // Obtenemos los h2
    let h2 = [...parsedDocument.getElementsByTagName("h2")];
    // En la posicion 9 del arreglo se encuentra el nombre de la materia
    let nombreMateria = h2[9].innerText;
    // La informacion de los profes y horarios esta en una tabla,
    // entonces hay que fijarnos en las tablas del documento
    let tables = [...parsedDocument.getElementsByTagName("table")];
    // Arreglo donde vamos a guardar el texto de las tablas que cumplan con la hora deseada
    let res = {
        nombreMateria,
        validas : []
    }
    // Iteramos sobre las tablas
    for(t in tables){
        let rows = [...tables[t].getElementsByTagName("tr")];
        for(r in rows){
            
            let cells = rows[r].getElementsByTagName("td");
            // Hacemos esto porque hay profesores que no tienen asignado horario y no tienen 4 <td> en <tr>
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


// DOM parser para poder tener acceso al html de los links de las materias
const parser = new DOMParser();

// Esperamos el mensaje
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

    // Filtramos todos los links de la pagina para solo quedarnos con 
    // los que sean de materias
    let links = [...document.getElementsByTagName("a")];
    links = links.map(link => {return link.href});
    links = links.filter(link => {
        return link.includes("/docencia/horarios") && !(link.includes("indiceplan"));
    });
    // Los primeros 4 no nos sirven, no me acuerdo por que xd
    links.splice(0,4);
    // Con la lista de links de materias, los "visitamos" para saber cuales coinciden
    // con la hora 
    generarHorario(links, msg.hora).then((clases) => {
        sendResponse(clases);
    });
    // Esto es para indicarle al canal de mensaje que la respuesta es asincrona 
    // y mantenga el canal abierto
    return true;
});