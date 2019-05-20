/******************************************************************
 ** Archivo: script.js
 ** Lenguaje: JavaScript
 ** Librerias: Vis.js.
 ** Descripción: Manejo de datos, y testeo del AFD.
 ** Autores: Eduardo Hopperdietzel, Diego Sandoval y Felipe Salazar.
*******************************************************************/

// Alfabeto del AFD ( Arreglo de caracteres )
var alpha = [];

// Estado inicial ( Índice )
var initialState = null;

// Estados finales ( Arreglo de índices )
var finalStates = [];

// Transiciones, Arreglo[número de nodos][largo del alfabeto]
var transitionsTable;

// Verifica que el AFD esté bien definido
function isCorrectAFD()
{
  // Verifica que posea estado inicial
  if(!("init" in transitions._data))
  {
    alert("Debe asigar el estado inicial.");
    return false;
  }

  // Verifica que exista al menos un estado final
  for(var key in nodes._data)
  {
    if( nodes._data[key].final )
      return true;
  }

  alert("Debe asignal al menos un estado final.");
  return false;
}

// Genera una estructura de datos eficiente a partir del grafo, Arreglo[número de nodos][largo del alfabeto]
function generateAFD()
{
  // Alfabeto del AFD ( Almacena carácteres )
  alpha = [];

  // Estados del AFD ( Almacena los nombres de los estados )
  var states = [];

  // Estados finales ( Almacena los índices de estos estados )
  finalStates = [];

  // Obtiene el alfabeto del AFD ( A partir de las transiciones del grafo )
  for(var key in transitions._data)
  {
    if(key != "init")

    // Si no se ha añadido a el arreglo
    if(!alpha.includes(transitions._data[key].label))
      alpha.push(transitions._data[key].label);
  }

  // Obtiene el arreglo de estados del grafo
  for(var key in nodes._data)
  {
    if(key != "init")
      states.push(nodes._data[key].id);
  }

  // Obtiene los índices de los estados finales
  for(var key in nodes._data)
  {
    if(nodes._data[key].final)
      finalStates.push(states.indexOf(nodes._data[key].id));
  }

  // Obtiene el estado inicial
  initialState = states.indexOf(transitions._data["init"].to);

  // Genera una tabla vacía
  transitionsTable = [];

  // Genera la tabla de transiciones
  for( var x = 0; x < states.length; x++)
  {
    var row = [];
    for(var y = 0; y < alpha.length; y++)
      row.push(null);
    transitionsTable.push(row);
  }

  // Completa la tabla
  for(var key in transitions._data)
    if(key != "init")
    {
      var row = transitionsTable[states.indexOf(transitions._data[key].from)];
      row[alpha.indexOf(transitions._data[key].label)] = states.indexOf(transitions._data[key].to);
      transitionsTable[states.indexOf(transitions._data[key].from)] = row;
    }
}

function testAFD()
{
  // Verifica que el AFD esté bien definido
  if(!isCorrectAFD()) return;

  // Genera la tabla de transiciones a partir del grafo
  generateAFD();

  // Obtiene la lista de palabras a testear desde la interfaz
  var words = document.getElementById('wordList').value.split('\n');

  // Almacena la salida de cada palabra (Aceptada / Rechazada)
  var output = [];

  // Loop por palabra
  for(var i = 0; i < words.length; i++)
  {
    // Almacena la palabra
    var word = words[i];

    // Para indicar si la palabra se acepto
    var accepted = true;

    // Almacena el estado actual
    var lastNode = initialState;

    // Loop por letra de la palabra actual
    for(var l = 0; l < word.length; l++)
    {
      // Si no encuentra
      accepted = false;

      // Letra actual
      var char = word.charAt(l);

      // Índice de la transición en la tabla
      var y = alpha.indexOf(char);

      // Si no existe la letra en el Alfabeto
      if( y == -1 ) break;
      console.log(lastNode);

      // Si la transición no existe
      if(transitionsTable[lastNode][y] == null)
      {
        break;
      }
      else
      {
        // Obtiene el estado de destino
        lastNode = transitionsTable[lastNode][y];
        accepted = true;
      }

    }

    // Si se recorrieron todas las transiciones
    if(accepted)
    {
      // Verifica que el último estado sea final
      output.push({word:word,state:finalStates.indexOf(lastNode) != -1});
    }
    else {
      output.push({word:word,state:false});
    }
  }

  printOutput(output);
}

// Imprime la salida del AFD
function printOutput(output)
{
  // Header de la tabla
  var html = '<table><colgroup><col width="100%"/><col width="0%" /></colgroup><tr><th>Palabra</th><th>Salida</th></tr>';

  // Filas de la tabla
  for(var i = 0; i < output.length; i++)
  {
    html+= '<tr><td>' + output[i].word + '</td><td><div class="';

    if(output[i].state)
      html+='a">Aceptada';
    else
      html+='b">Rechazada';

    html+='</div></td></tr>';

  }

  // Final de la tabla
  html += "</table>";

  // Imprme el html
  document.getElementById('output').innerHTML = html;
}
