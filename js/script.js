var nodeCount = 1;
var transitionCount = 0;

var nodes = new vis.DataSet([{id:"init",final:false,color:{border:'#FFF',highlight:{border:"#FFF"}}},{id:0,label:"q0"}]);

// create an array with edges
var transitions = new vis.DataSet([{id:"init",from:"init",to:0,manipulation:{enabled:false},color:{color:'#3FA9F5',highlight:'#3FA9F5'}}]);

// create a network
var container = document.getElementById('mynetwork');

function testAFD()
{
  var words = document.getElementById('wordList').value.split('\n');
  var output = [];
  var trans = transitions._data;

  // Loop de palabras
  for(var i = 0; i < words.length; i++)
  {
    // Almacena la palabra
    var word = words[i];

    // Para indicar si la palabra se acepto
    var accepted = true;

    // Obtiene el estado actual
    var lastNode = transitions._data["init"].to;

    // Si la palabra no es vacía
    if(word != "")
    {
      // Loop por letra
      for(var l = 0; l < word.length; l++)
      {
        // Letra actual
        var char = word.charAt(l);

        // Si no encuentra
        accepted = false;

        // Busca si hay una transición con esa letra
        for(var t in trans)
        {
          if(trans[t].from == lastNode && trans[t].label == char)
          {
            // Si se encuentra
            accepted = true;

            // Asigna el nuevo nodo actual
            lastNode = trans[t].to;

            // Sale del loop de transiciones
            break;
          }
        }

        // Si no encuentra la transición
        if(!accepted)
          break;

      }

      // Si se recorrieron todas las transiciones
      if(accepted)
      {
        // Verifica que el último estado sea final
        output.push({word:word,state:nodes._data[lastNode].final});
      }
      else {
        output.push({word:word,state:false});
      }
    }
  }

  // Imprime la salida
  var html = '<table><colgroup><col width="100%"/><col width="0%" /></colgroup><tr><th>Palabra</th><th>Salida</th></tr>';

  for(var i = 0; i < output.length; i++)
  {
    html+= '<tr><td>' + output[i].word + '</td><td><div class="';

    if(output[i].state)
      html+='a">Aceptada';
    else
      html+='b">Rechazada';

    html+='</div></td></tr>';

  }
  html += "</table>";

  document.getElementById('output').innerHTML = html;
}

// provide the data in the vis format
var data =
{
    nodes: nodes,
    edges: transitions
};

var locales = {
  es: {
    edit: 'Editar',
    del: 'Eliminar',
    back: 'Volver',
    addNode: 'Añadir Nodo',
    addEdge: 'Añadir Transición',
    editNode: 'Editar Nodo',
    editEdge: 'Editar Transición',
    addDescription: 'Haga click en un espacio vacío para añadir un nodo.',
    edgeDescription: 'Haga click en un nodo y arrastre al destino.',
    editEdgeDescription: 'Click on the control points and drag them to a node to connect to it.',
    createEdgeError: 'Cannot link edges to a cluster.',
    deleteClusterError: 'Clusters cannot be deleted.',
    editClusterError: 'Clusters cannot be edited.'
  }
}

var options =
{
  locales:locales,
  locale: 'es',
  interaction:
  {
    navigationButtons: true,
    keyboard: true,
  },
  manipulation:
  {
    addNode: function (data, callback)
    {
      addNode(data, callback);
    },
    editNode: function (data, callback)
    {
      editNode(data, callback);
    },
    addEdge: function (data, callback) {
      createTransition(data, callback);
    },
    editEdge: {
      editWithoutDrag: function(data, callback) {
        editTransition(data, callback);
      }
    }
  },
  edges:
  {
    arrows:
    {
      to: {enabled: true, type:'arrow'}
    },
    color:
    {
      color:'#848484',
      highlight:'#848484',
      hover: '#848484',
      opacity:1.0
    },
  },
  nodes:
  {
    shape: 'circle',

    color: {
      border:'#666',
      background:'#FFF',
      highlight:{
        border:"#666",
        background:"#FFF"
      }
    },
    font: {
      color: '#343434',
      size: 12,
      face: 'verdana',
      align: 'center'
    }
  }
};

// Inicia la interfaz gráfica
var network = new vis.Network(container, data, options);

network.on("selectEdge", function (params)
{
    if(params.edges[0] == "init")
      network.selectEdges([]);
});

network.on("selectNode", function (params)
{
    if(params.nodes[0] == "init")
      network.selectNodes([]);
});

// Añade un nodo
function addNode(data, callback)
{
  // Asigna su id ( Utilizado para trabajar con la interfaz )
  data.id = nodeCount;

  // Lo asigna como estado no final
  data.final = false;

  // Asigna el nombre
  data.label = "q"+nodeCount.toString();

  // Incrementa el contador de nodos
  nodeCount++;

  // Imprime el nodo en la interfaz
  callback(data);
}
// Edita un nodo
function editNode(data,callback)
{
  document.getElementById('nodeEditDialog').style.display = "initial";
  document.getElementById('name').value = data.label;
  if('init' in transitions._data)
  {
    document.getElementById('initial').checked = transitions._data["init"].to == data.id;
  }
  else {
    document.getElementById('initial').checked = false;
  }

  document.getElementById('final').checked = nodes._data[data.id].final;

  document.getElementById('cancel').onclick = function()
  {
    document.getElementById('nodeEditDialog').style.display = "none";
    callback(null);
    return;
  }

  document.getElementById('save').onclick = function()
  {
    // Asigna el nombre
    data.label = document.getElementById('name').value;

    // Asigna si es estado final
    data.final = document.getElementById('final').checked;

    if(data.final)
      data.color = {border:'#7AC943',highlight:{border:"#7AC943"}};
    else
      data.color = null;

    callback(data);

    // Asigna si es estado inicial
    if(document.getElementById('initial').checked)
    {
      if('init' in transitions._data)
      {
        transitions.remove("init");
        transitions.add([{id:"init",from:"init",to:data.id,manipulation:{enabled:false},color:{color:'#3FA9F5',highlight:'#3FA9F5'}}]);
      }
      else
      {
        transitions.add([{id:"init",from:"init",to:data.id,manipulation:{enabled:false},color:{color:'#3FA9F5',highlight:'#3FA9F5'}}]);
      }
    }
    else
    {
      if('init' in transitions._data)
      {
        if(transitions._data["init"].to == data.id)
        {
          transitions.remove("init");
        }
      }
    }


    document.getElementById('nodeEditDialog').style.display = "none";
    return;
  }
}

// Crea una transición
function createTransition(data, callback)
{
  // Si es el nodo utilizado para la transición inicial
  if(data.from == "init" || data.to == "init")
  {
    callback(null);
    return;
  }

  // Asigna el nombre de la transición
  data.label = prompt("Ingrese el nombre de la transición").trim();

  // Verifica si se cancela o si el nombre es vacio
  if(data.label == null || data.label == "")
  {
    callback(null);
    return;
  }

  // Verifica que no exista una transición con el mismo nombre en el nodo
  for(var trans in transitions._data)
  {
    if(transitions._data[trans].from == data.from && transitions._data[trans].label == data.label)
    {
      alert("El nodo ya contiene una transición con este nombre.\nElija otro nombre.");
      createTransition(data, callback);
      return;
    }
  }

  data.id = transitionCount;
  transitionCount++;
  // Imprime la transición en la interfaz
  callback(data);
}

// Edita una transición
function editTransition(data, callback)
{

  // Asigna el nuevo nombre de la transición
  data.label = prompt("Ingrese el nuevo nombre de la transición");

  // Verifica si se cancela o si el nombre es vacio
  if(data.label == null || data.label == false || data.label == "")
  {
    callback(null);
    return;
  }

  // Verifica que no exista una transición con el mismo nombre en el nodo
  for(var trans in transitions._data)
  {
    if(transitions._data[trans].from == data.from && transitions._data[trans].label == data.label)
    {
      alert("El nodo ya contiene una transición con este nombre.\nElija otro nombre.");
      editTransition(data, callback);
      return;
    }
  }

  // Establece su origen y destino
  data.from = data.from.id;
  data.to = data.to.id;

  // Imprime los cambios
  callback(data);
}

/*
var nodes = null;
var edges = null;
var network = null;
// randomly create some nodes and edges
var data = getScaleFreeNetwork(25);
var seed = 2;

function setDefaultLocale() {
  var defaultLocal = navigator.language;
  var select = document.getElementById('locale');
  select.selectedIndex = 0; // set fallback value
  for (var i = 0, j = select.options.length; i < j; ++i) {
    if (select.options[i].getAttribute('value') === defaultLocal) {
      select.selectedIndex = i;
      break;
    }
  }
}

function destroy() {
  if (network !== null) {
    network.destroy();
    network = null;
  }
}

function draw() {
  destroy();
  nodes = [];
  edges = [];

  // create a network
  var container = document.getElementById('mynetwork');
  var options = {
    layout: {randomSeed:seed}, // just to make sure the layout is the same when the locale is changed
    locale: document.getElementById('locale').value,
    manipulation: {
      addNode: function (data, callback) {
        // filling in the popup DOM elements
        document.getElementById('node-operation').innerHTML = "Add Node";
        editNode(data, clearNodePopUp, callback);
      },
      editNode: function (data, callback) {
        // filling in the popup DOM elements
        document.getElementById('node-operation').innerHTML = "Edit Node";
        editNode(data, cancelNodeEdit, callback);
      },
      addEdge: function (data, callback) {
        if (data.from == data.to) {
          var r = confirm("Do you want to connect the node to itself?");
          if (r != true) {
            callback(null);
            return;
          }
        }
        document.getElementById('edge-operation').innerHTML = "Add Edge";
        editEdgeWithoutDrag(data, callback);
      },
      editEdge: {
        editWithoutDrag: function(data, callback) {
          document.getElementById('edge-operation').innerHTML = "Edit Edge";
          editEdgeWithoutDrag(data,callback);
        }
      }
    }
  };
  network = new vis.Network(container, data, options);
}

function editNode(data, cancelAction, callback) {
  document.getElementById('node-label').value = data.label;
  document.getElementById('node-saveButton').onclick = saveNodeData.bind(this, data, callback);
  document.getElementById('node-cancelButton').onclick = cancelAction.bind(this, callback);
  document.getElementById('node-popUp').style.display = 'block';
}

// Callback passed as parameter is ignored
function clearNodePopUp() {
  document.getElementById('node-saveButton').onclick = null;
  document.getElementById('node-cancelButton').onclick = null;
  document.getElementById('node-popUp').style.display = 'none';
}

function cancelNodeEdit(callback) {
  clearNodePopUp();
  callback(null);
}

function saveNodeData(data, callback) {
  data.label = document.getElementById('node-label').value;
  clearNodePopUp();
  callback(data);
}

function editEdgeWithoutDrag(data, callback) {
  // filling in the popup DOM elements
  document.getElementById('edge-label').value = data.label;
  document.getElementById('edge-saveButton').onclick = saveEdgeData.bind(this, data, callback);
  document.getElementById('edge-cancelButton').onclick = cancelEdgeEdit.bind(this,callback);
  document.getElementById('edge-popUp').style.display = 'block';
}

function clearEdgePopUp() {
  document.getElementById('edge-saveButton').onclick = null;
  document.getElementById('edge-cancelButton').onclick = null;
  document.getElementById('edge-popUp').style.display = 'none';
}

function cancelEdgeEdit(callback) {
  clearEdgePopUp();
  callback(null);
}

function saveEdgeData(data, callback) {
  if (typeof data.to === 'object')
    data.to = data.to.id
  if (typeof data.from === 'object')
    data.from = data.from.id
  data.label = document.getElementById('edge-label').value;
  clearEdgePopUp();
  callback(data);
}

function init() {
  setDefaultLocale();
  draw();
}
*/
