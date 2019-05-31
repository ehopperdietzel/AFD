/******************************************************************
 ** Archivo: interface.js
 ** Lenguaje: JavaScript
 ** Librerias: Vis.js.
 ** Descripción: Manejo de interfaz.
 ** Autores: Eduardo Hopperdietzel, Diego Sandoval y Felipe Salazar.
*******************************************************************/

// Contador de nodos de la interfaz ( Para generar nombres q0,q1,... automáticamente )
var nodeCount = 1;

// Contador de transiciones ( Utilizado por la interfaz )
var transitionCount = 0;

// Arreglo de nodos de la interfaz ( Con un nodo inicial por defecto )
var nodes = new vis.DataSet([{id:"init",final:false,color:{border:'#FFF',highlight:{border:"#FFF"}}},{id:0,label:"q0"}]);

// Arreglo de transiciones de la interfaz ( Con una inicial asiganada al nodo inicial )
var transitions = new vis.DataSet([{id:"init",from:"init",to:0,manipulation:{enabled:false},color:{color:'#3FA9F5',highlight:'#3FA9F5'}}]);

// Ventana donde se visualizará el grafo
var container = document.getElementById('mynetwork');

// Estructura los datos para ser utilizados por Vis
var data =
{
    nodes: nodes,
    edges: transitions
};

// Textos del menú de la interfaz
var locales =
{
  es:
  {
    edit: 'Editar',
    del: 'Eliminar',
    back: 'Volver',
    addNode: 'Añadir Estado',
    addEdge: 'Añadir Transición',
    editNode: 'Editar Estado',
    editEdge: 'Editar Transición',
    addDescription: 'Haga click en un espacio vacío para añadir un estado.',
    edgeDescription: 'Haga click en un estado y arrastre al destino.',
    editEdgeDescription: 'Click on the control points and drag them to a node to connect to it.',
    createEdgeError: 'Cannot link edges to a cluster.',
    deleteClusterError: 'Clusters cannot be deleted.',
    editClusterError: 'Clusters cannot be edited.'
  }
};

// Configuracion de Vis ( Eventos, restricciones y estilos gráficos )
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

// Añade un nodo a la interfaz
function addNode(data, callback)
{
  // Asigna su id ( Utilizado para trabajar con la interfaz )
  data.id = nodeCount;

  // Lo asigna como estado no final
  data.final = false;

  // Asigna nombre por defecto
  data.label = "q"+nodeCount.toString();

  // Incrementa el contador de nodos
  nodeCount++;

  // Imprime el nodo en la interfaz
  callback(data);
}

// Edita un nodo
function editNode(data,callback)
{
  // Muestra el menu para editar un nodo
  document.getElementById('nodeEditDialog').style.display = "initial";

  // Asigna el nombre actual del nodo al input
  document.getElementById('name').value = data.label;

  // Verifica si el nodo selecionado es inicial
  if('init' in transitions._data)
  {
    document.getElementById('initial').checked = transitions._data["init"].to == data.id;
  }
  else {
    document.getElementById('initial').checked = false;
  }

  // Verifica si el nodo seleccionado es estado final
  document.getElementById('final').checked = nodes._data[data.id].final;

  // Función al presionar el botón "Cancelar"
  document.getElementById('cancel').onclick = function()
  {
    // Esconde el diálogo
    document.getElementById('nodeEditDialog').style.display = "none";

    // No modifica el nodo
    callback(null);
    return;
  }

  // Función al presionar el botón "Guardar"
  document.getElementById('save').onclick = function()
  {
    // Lee el nuevo nombre del nodo
    var label = document.getElementById('name').value.trim();

    // Verifica que el nombre no sea vacío
    if(label == "")
    {
      alert("El nombre del estado no puede ser vacío.");
      return;
    }
    // Verifica que el nuevo nombre no sea el mismo que el de otro nodo
    for(var node in nodes._data)
    {
      if(nodes._data[node].label == label && nodes._data[node].id != data.id)
      {
        alert("Ya existe un estado con ese nombre.\nPor favor elija otro.");
        return;
      }
    }

    // Si el nombre es válido, se le asigna
    data.label = label;

    // Asigna si es estado final
    data.final = document.getElementById('final').checked;

    // Modifica los estilos graficos
    if(data.final)
      data.color = {border:'#7AC943',highlight:{border:"#7AC943"}};
    else
      data.color = null;

    // Asigna los nuevos datos al nodo
    callback(data);

    // Asigna si es estado inicial ( Estilos gráficos )
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

    // Esconde el diálogo
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
      alert("El estado ya contiene una transición con este nombre.\nElija otro nombre.");
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
      alert("El estado ya contiene una transición con este nombre.\nElija otro nombre.");
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


// Restringe la selección de ciertas transiciones
network.on("selectEdge", function (params)
{
    if(params.edges[0] == "init")
      network.selectEdges([]);
});

// Restringe la selecciónn de ciertos nodos
network.on("selectNode", function (params)
{
    if(params.nodes[0] == "init")
      network.selectNodes([]);
});
