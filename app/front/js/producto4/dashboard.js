// Iniciamos el servicio de socket
let socket = io();

socket.on("showToast", (msg)=> {
  console.log(msg);
  goLiveToast();
});

socket.on("fileToast", (msg)=> {
  console.log(msg);
  goLiveFileToast();
});

function goLiveToast() {
  var myToast = document.getElementById("liveToast");
  var bsToast = new bootstrap.Toast(myToast);
  bsToast.show();
  setTimeout(function() {
      bsToast.hide();
  }, 5000);
}

function goLiveFileToast() {
  var myToast = document.getElementById("fileToast");
  var bsToast = new bootstrap.Toast(myToast);
  bsToast.show();
  setTimeout(function() {
      bsToast.hide();
  }, 5000);
}

// Seleccionar el formulario y los contenedores de la tarjetas
const form = document.querySelector("#myForm");
const modal = document.querySelector("#formTask");
const dropUnassigned = document.getElementById("unassignedTasks");
const dropDay1 = document.getElementById("day1");
const dropDay2 = document.getElementById("day2");
const dropDay3 = document.getElementById("day3");
const dropDay4 = document.getElementById("day4");
const dropDay5 = document.getElementById("day5");
const dropDay6 = document.getElementById("day6");
const dropDay7 = document.getElementById("day7");
const targetCard = document.getElementById("target-card");

const fileForm = document.querySelector("#myFileForm");
const fileModal = document.querySelector("#fileTask");

// Agregar controladores de eventos para eventos de arrastrar y soltar
dropUnassigned.addEventListener("dragover", dragOver);
dropUnassigned.addEventListener("drop", drop);
dropDay1.addEventListener("dragover", dragOver);
dropDay1.addEventListener("drop", drop);
dropDay2.addEventListener("dragover", dragOver);
dropDay2.addEventListener("drop", drop);
dropDay3.addEventListener("dragover", dragOver);
dropDay3.addEventListener("drop", drop);
dropDay4.addEventListener("dragover", dragOver);
dropDay4.addEventListener("drop", drop);
dropDay5.addEventListener("dragover", dragOver);
dropDay5.addEventListener("drop", drop);
dropDay6.addEventListener("dragover", dragOver);
dropDay6.addEventListener("drop", drop);
dropDay7.addEventListener("dragover", dragOver);
dropDay7.addEventListener("drop", drop);

// Agregar un escuchador de evento "SUBMIT" para el formulario
form.addEventListener("submit", (event) => {
  // Prevenir que el formulario se envíe
  event.preventDefault();

  // Capturar los valores de los campos de entrada
  const name = document.querySelector("#nameInput").value;
  const desc = document.querySelector("#descInput").value;
  const hIni = document.querySelector("#iniInput").value;
  const hEnd = document.querySelector("#endInput").value;
  const tTyp = document.querySelector('input[name="taskType"]:checked').value;
  const user = document.querySelector("#userInput").value;
  const inDay = document.querySelector("#inDay").value;
  const fini = document.querySelector("#finishedInput").checked ? true : false;
  var _id = "";

  // Fetch para crear una semana
  fetch("http://localhost:5000", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
      mutation {
        createTask(
          _id_week: "${idWeek}",
          name: "${name}",
          description: "${desc}",
          hour_ini: "${hIni}",
          hour_end: "${hEnd}",
          type: "${tTyp}",
          user: "${user}",
          in_day: "${inDay}",
          finished: ${fini}
        ) {
          _id
          name
          description
          hour_ini
          hour_end
          type
          user
          in_day
          finished
        }
      }
    `,
    }),
  })
  .then((res) => res.json())
  .then((res) => {
    _id = res.data.createTask._id;
    socket.emit("createTask", "Se ha creado una nueva tarea.");
    // Crear un nuevo elemento HTML para la tarjeta
    const card = document.createElement("div");
    card.classList.add("card");
    card.classList.add("cardTask");
    card.id = _id;
    card.innerHTML = `
      <p class="fName"><b>${name}</b></p>
      <p class="fDesc">${desc}</p>
      <div class="buttonsDiv">
        <button type="button" class="btn btn-success xx-small button-editTask" data-bs-toggle="modal" data-bs-target="#formTask" task-id="${_id}"><i class="fa fa-edit fa-lg"></i></button>
        <button type="button" class="btn btn-info xx-small button-fileTask" data-bs-toggle="modal" data-bs-target="#fileTask" task-id="${_id}"><i class="fa fa-file-o fa-lg"></i></button>
        <button type="button" class="btn btn-danger xx-small button-deleteTask" data-bs-toggle="modal" data-bs-target="#myModalDelete"><i class="fa fa-trash-o fa-lg"></i></button>
      </div>
    `;
  
    // Obtener el primer botón dentro del elemento "card"
    const editTask = card.querySelector(".button-editTask");
    const editCard = editTask.parentElement.parentElement;
  
    // Agregar un controlador de eventos "click" al segundo botón
    editTask.addEventListener("click", () => {
      // Reiniciamos el formulario
      form.reset();
      // Añadimos la información de la tarea al formulario
      llenarDatosTarea(_id);
      // Añadimos una clase a la tarjeta que estamos editando para poder actualizarla después
      editCard.classList.add("editing");
      // Ocultamos el botón de crear tarea
      document.getElementById("modal-add-create").style.display = "none";
      // Mostramos el botón de guardar cambios (para editar la tarea)
      document.getElementById("modal-add-save").style.display = "block";
      // Ocultamos el campo de añadir al día en la edición de la tarjeta
      document.querySelector(".div-add-into").style.display = "none";
    });
  
    // Obtener el segundo botón dentro del elemento "card"
    const deleteTask = card.querySelector(".button-deleteTask");
  
    // Agregar un controlador de eventos "click" al segundo botón
    deleteTask.addEventListener("click", () => {
      // Obtener el elemento "div" que contiene el botón y eliminarlo
      const dropUnassigned = deleteTask.parentElement.parentElement;
  
      const modalDelete = document.querySelector("#myModalDelete");
      const modalInstance = bootstrap.Modal.getInstance(modalDelete);
      modalInstance.show();
  
      // Funcionalidad de quitar tarjeta (elimina tarjeta)
      const deleteCard = document.querySelector("#deleteCard");
      deleteCard.addEventListener("click", () => {
        modalInstance.hide();
        if (card.parentNode) {
          dropUnassigned.remove();
          tareaEliminada(_id);
        }
      });
    });
  
    // Agregar atributo "draggable" al elemento "card"
    card.setAttribute("draggable", true);
  
    // Agregar controladores de eventos para eventos de arrastrar y soltar
    card.addEventListener("dragstart", dragStart);
    card.addEventListener("dragend", dragEnd);
  
    function dragStart() {
      // Establecer el efecto de arrastrar
      this.classList.add("dragging");
    }
  
    function dragEnd() {
      // Restablecer el efecto de arrastrar
      this.classList.remove("dragging");
    }
  
    // Agregar la tarjeta al contenedor que toque según el día clickado
    var tC = document.getElementById("target-card").value;
  
    if (tC == "1" || inDay == "L") {
      dropDay1.appendChild(card);
    } else if (tC == "2" || inDay == "M") {
      dropDay2.appendChild(card);
    } else if (tC == "3" || inDay == "X") {
      dropDay3.appendChild(card);
    } else if (tC == "4" || inDay == "J") {
      dropDay4.appendChild(card);
    } else if (tC == "5" || inDay == "V") {
      dropDay5.appendChild(card);
    } else if (tC == "6" || inDay == "S") {
      dropDay6.appendChild(card);
    } else if (tC == "7" || inDay == "D") {
      dropDay7.appendChild(card);
    } else {
      dropUnassigned.appendChild(card);
    }
  
    // Limpiar los valores del formulario
    form.reset();
  
    // Cerrar el modal después de agregar la tarjeta
    const modal = document.querySelector("#formTask");
    const modalInstance = bootstrap.Modal.getInstance(modal);
    modalInstance.hide();
  });
});

function dragOver(event) {
  // Prevenir el comportamiento predeterminado
  event.preventDefault();
}

function drop(event) {
  // Prevenir el comportamiento predeterminado
  event.preventDefault();

  // Obtener el elemento arrastrado
  const draggedElement = document.querySelector(".dragging");

  // Verificar en qué div se soltó el elemento y moverlo al div correspondiente
  var newDay = "0";
  if (event.target.id === "day1") {
    newDay = "1";
    dropDay1.appendChild(draggedElement);
  } else if (event.target.id === "day2") {
    newDay = "2";
    dropDay2.appendChild(draggedElement);
  } else if (event.target.id === "day3") {
    newDay = "3";
    dropDay3.appendChild(draggedElement);
  } else if (event.target.id === "day4") {
    newDay = "4";
    dropDay4.appendChild(draggedElement);
  } else if (event.target.id === "day5") {
    newDay = "5";
    dropDay5.appendChild(draggedElement);
  } else if (event.target.id === "day6") {
    newDay = "6";
    dropDay6.appendChild(draggedElement);
  } else if (event.target.id === "day7") {
    newDay = "7";
    dropDay7.appendChild(draggedElement);
  } else {
    dropUnassigned.appendChild(draggedElement);
  }
  
  var id_task = draggedElement.id;
  // Fetch para actualizar el día asignado a una tarea
  fetch("http://localhost:5000", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
      mutation {
        updateTaskDay(
          _id: "${id_task}",
          in_day: "${newDay}"
        ) {
          _id
          in_day
        }
      }
    `,
    }),
  })
    .then((res) => res.json())
    .then((res) => {
      socket.emit("updateTaskDay", "Una tarea se ha movido de día.");
    });
}

// Seleccionamos todos los elementos con la clase "button-add"
const btnAdd = document.querySelectorAll(".button-add");

// Agregamos un evento de click a cada uno de ellos
btnAdd.forEach((btn) => {
  btn.addEventListener("click", () => {
    const idDay = btn.getAttribute("target-day");
    assignTarget(idDay);
    // Ocultamos el campo de añadir al día si se ha clickado en un botón de un día en concreto
    if (idDay != "0") {
      document.querySelector(".div-add-into").style.display = "none";
    }
    // Reiniciamos el formulario
    form.reset();
    // Mostramos el botón de crear tarea
    document.getElementById("modal-add-create").style.display = "block";
    // Ocultamos el botón de guardar cambios (para editar la tarea)
    document.getElementById("modal-add-save").style.display = "none";
  });
});

// Definir la función que se llamará al hacer clic en los botones para añadir tareas
function assignTarget(id) {
  targetCard.value = id;
}

// Funcionalidad de editar tarjeta (editar tarea)
const saveTask = document.querySelector("#modal-add-save");
saveTask.addEventListener("click", () => {
  // Prevenimos que el botón haga un "submit" al ser clicado
  event.preventDefault();
  // Recuperamos la tarjeta de la tarea que estamos editando mediante la clase "editing"
  const editingTask = document.querySelector(".editing");
  // Modificamos el contenido de la tarjeta con los nuevos valores del formulario
  const name = document.querySelector("#nameInput").value;
  const desc = document.querySelector("#descInput").value;
  const hIni = document.querySelector("#iniInput").value;
  const hEnd = document.querySelector("#endInput").value;
  const tTyp = document.querySelector('input[name="taskType"]:checked').value;
  const user = document.querySelector("#userInput").value;
  const days = document.querySelector("#inDay").value;
  const fini = document.querySelector("#finishedInput").checked ? true : false;
  
  // Fetch para actualizar una tarea
  fetch("http://localhost:5000", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
      mutation {
        updateTask(
          _id: "${editingTask.id}",
          name: "${name}",
          description: "${desc}",
          hour_ini: "${hIni}",
          hour_end: "${hEnd}",
          type: "${tTyp}",
          user: "${user}",
          in_day: "${days}",
          finished: ${fini}
        ) {
          _id
        }
      }
    `,
    }),
  })
    .then((res) => res.json())
    .then((res) => {
      socket.emit("updateTask", "Se ha modificado una tarea.");
    });

  editingTask.innerHTML = `
    <p class="fName"><b>${name}</b></p>
    <p class="fDesc">${desc}</p>
    <div class="buttonsDiv">
        <button type="button" class="btn btn-success xx-small button-editTask" data-bs-toggle="modal" data-bs-target="#formTask" task-id="${editingTask.id}"><i class="fa fa-edit fa-lg"></i></button>
        <button type="button" class="btn btn-info xx-small button-fileTask" data-bs-toggle="modal" data-bs-target="#fileTask"><i class="fa fa-file-o fa-lg"></i></button>
        <button type="button" class="btn btn-danger xx-small button-deleteTask" data-bs-toggle="modal" data-bs-target="#myModalDelete"><i class="fa fa-trash-o fa-lg"></i></button>
    </div>
  `;

  // Obtener el primer botón dentro del elemento "card"
  const editTask = editingTask.querySelector(".button-editTask");
  // Agregar un controlador de eventos "click" al segundo botón
  editTask.addEventListener("click", () => {
    // Reiniciamos el formulario
    form.reset();
    // Añadimos la información de la tarea al formulario
    const editCard = editTask.parentElement.parentElement;
    llenarDatosTarea(editCard.id);
    // Añadimos una clase a la tarjeta que estamos editando para poder actualizarla después
    editCard.classList.add("editing");
    // Ocultamos el botón de crear tarea
    document.getElementById("modal-add-create").style.display = "none";
    // Mostramos el botón de guardar cambios (para editar la tarea)
    document.getElementById("modal-add-save").style.display = "block";
    // Ocultamos el campo de añadir al día en la edición de la tarjeta
    document.querySelector(".div-add-into").style.display = "none";
  });

  // Obtener el segundo botón dentro del elemento "card"
  const deleteTask = editingTask.querySelector(".button-deleteTask");

  // Agregar un controlador de eventos "click" al segundo botón
  deleteTask.addEventListener("click", () => {
    // Obtener el elemento "div" que contiene el botón y eliminarlo
    const dropUnassigned = deleteTask.parentElement.parentElement;

    const modalDelete = document.querySelector("#myModalDelete");
    const modalInstance = bootstrap.Modal.getInstance(modalDelete);
    modalInstance.show();

    // Funcionalidad de quitar tarjeta (elimina tarjeta)
    const deleteCard = document.querySelector("#deleteCard");
    deleteCard.addEventListener("click", () => {
      modalInstance.hide();
      if (editingTask.parentNode) {
        dropUnassigned.remove();
      }
    });
  });

  // Limpiar los valores del formulario
  form.reset();

  // Cerrar el modal después de agregar la tarjeta
  const modal = document.querySelector("#formTask");
  const modalInstance = bootstrap.Modal.getInstance(modal);
  modalInstance.hide();
});

modal.addEventListener("hidden.bs.modal", function (event) {
  // Eliminamos la clase "editing" de cualquier tarea que se haya editado
  const editingTask = document.querySelectorAll(".editing");
  for (let i = 0; i < editingTask.length; i++) {
    editingTask[i].classList.remove("editing");
  }
  // Mostramos el campo de añadir al día
  document.querySelector(".div-add-into").style.display = "block";
});

// Recuperación del parámetro "_id" (identificador de semana) pasado por URL
const idWeek = new URLSearchParams(window.location.search).get("_id");

function writeCard(item) {
  // Crear un nuevo elemento HTML para la tarjeta
  const card = document.createElement("div");
  card.classList.add("card");
  card.classList.add("cardTask");
  card.id = item._id;
  card.innerHTML = `
    <p class="fName"><b>${item.name}</b></p>
    <p class="fDesc">${item.description}</p>
    <div class="buttonsDiv">
      <button type="button" class="btn btn-success xx-small button-editTask" data-bs-toggle="modal" data-bs-target="#formTask" task-id="${item._id}"><i class="fa fa-edit fa-lg"></i></button>
      <button type="button" class="btn btn-info xx-small button-fileTask" data-bs-toggle="modal" data-bs-target="#fileTask" task-id="${item._id}"><i class="fa fa-file-o fa-lg"></i></button>
      <button type="button" class="btn btn-danger xx-small button-deleteTask" data-bs-toggle="modal" data-bs-target="#myModalDelete" task-id="${item._id}"><i class="fa fa-trash-o fa-lg"></i></button>
    </div>
  `;

  // Obtener el primer botón dentro del elemento "card"
  const editTask = card.querySelector(".button-editTask");
  const fileTask = card.querySelector(".button-fileTask");
  const editCard = editTask.parentElement.parentElement;

  // Agregar un controlador de eventos "click" al segundo botón
  editTask.addEventListener("click", () => {
    // Reiniciamos el formulario
    form.reset();
    llenarDatosTarea(editCard.id);
    // Añadimos una clase a la tarjeta que estamos editando para poder actualizarla después
    editCard.classList.add("editing");
    // Ocultamos el botón de crear tarea
    document.getElementById("modal-add-create").style.display = "none";
    // Mostramos el botón de guardar cambios (para editar la tarea)
    document.getElementById("modal-add-save").style.display = "block";
    // Ocultamos el campo de añadir al día en la edición de la tarjeta
    document.querySelector(".div-add-into").style.display = "none";
  });

  // Agregar un controlador de eventos "click" al segundo botón
  fileTask.addEventListener("click", () => {
    // Reiniciamos el formulario
    fileForm.reset();
    document.querySelector("#file-task-card").value = fileTask.getAttribute("task-id");
    // Añadimos una clase a la tarjeta que estamos editando para poder actualizarla después
    editCard.classList.add("editing");
  });

  // Obtener el segundo botón dentro del elemento "card"
  const deleteTask = card.querySelector(".button-deleteTask");

  // Agregar un controlador de eventos "click" al segundo botón
  deleteTask.addEventListener("click", () => {
    // Obtener el elemento "div" que contiene el botón y eliminarlo
    const dropUnassigned = deleteTask.parentElement.parentElement;

    const modalDelete = document.querySelector("#myModalDelete");
    const modalInstance = bootstrap.Modal.getInstance(modalDelete);
    modalInstance.show();

    // Funcionalidad de quitar tarjeta (elimina tarjeta)
    const deleteCard = document.querySelector("#deleteCard");
    deleteCard.addEventListener("click", () => {
      modalInstance.hide();
      if (card.parentNode) {
        dropUnassigned.remove();
        tareaEliminada(item._id);
      }
    });
  });

  // Agregar atributo "draggable" al elemento "card"
  card.setAttribute("draggable", true);

  // Agregar controladores de eventos para eventos de arrastrar y soltar
  card.addEventListener("dragstart", dragStart);
  card.addEventListener("dragend", dragEnd);

  function dragStart() {
    // Establecer el efecto de arrastrar
    this.classList.add("dragging");
  }

  function dragEnd() {
    // Restablecer el efecto de arrastrar
    this.classList.remove("dragging");
  }

  // Agregar la tarjeta al contenedor que toque según el día clickado
  var tC = item.in_day;

  if (tC == "1" || inDay == "L") {
    dropDay1.appendChild(card);
  } else if (tC == "2" || inDay == "M") {
    dropDay2.appendChild(card);
  } else if (tC == "3" || inDay == "X") {
    dropDay3.appendChild(card);
  } else if (tC == "4" || inDay == "J") {
    dropDay4.appendChild(card);
  } else if (tC == "5" || inDay == "V") {
    dropDay5.appendChild(card);
  } else if (tC == "6" || inDay == "S") {
    dropDay6.appendChild(card);
  } else if (tC == "7" || inDay == "D") {
    dropDay7.appendChild(card);
  } else {
    dropUnassigned.appendChild(card);
  }
};

// Elimina el elemento padre del elemento que se haya seleccionado
function tareaEliminada(_id) {
  // Fetch para eliminar una tarea
  fetch("http://localhost:5000", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
      mutation {
        deleteTask(
          _id: "${_id}"
        ) {
          _id
        }
      }
    `,
    }),
  })
    .then((res) => res.json())
    .then((res) => {
      socket.emit("deleteTask", "Se ha eliminado una tarea.");
    });
}

// Carga de datos inicial con conexión a MongoDB. 
// Conexion al servidor GraphQl para la llamada getTasksByWeek(idWeek)
// Se ejecutará siempre y cuando la semana no provenga del mockup (es decir, cuando venga de base de datos)
if (!idWeek.includes("mockup-")) { // Este if no se aplicará nunca porque ya no estamos en el producto 2, donde se podían crear semanas como mockup
  fetch("http://localhost:5000", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `{
        getTasksByWeek(_id_week: "${idWeek}") {
          _id
          name
          description
          hour_ini
          hour_end
          type
          user
          in_day
          finished
        }
      }`,
    }),
  }).then((res) => res.json())
    .then((res) => {
      res.data.getTasksByWeek.map((item) => writeCard(item));
    });
  
  fetch("http://localhost:5000", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `{
        getWeekById(_id: "${idWeek}") {
          _id
          week
          year
        }
      }`,
    }),
  }).then((res) => res.json())
    .then((res) => {
      document.querySelector("#breadcrumb-current").innerHTML = "Semana " + res.data.getWeekById.week + " del año " + res.data.getWeekById.year;
    });
} else {
  var text = idWeek.replace("mockup-", "").replace("-", " del año ");
  document.querySelector("#breadcrumb-current").innerHTML = "Semana " + text;
}

function llenarDatosTarea(id) {
  fetch("http://localhost:5000", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `{
        getTaskById(_id: "${id}") {
          _id
          name
          description
          hour_ini
          hour_end
          type
          user
          in_day
          finished
        }
      }`,
    }),
  }).then((res) => res.json())
    .then((res) => {
    // Añadimos la información de la tarea al formulario
    document.querySelector("#nameInput").value = res.data.getTaskById.name;
    document.querySelector("#descInput").value = res.data.getTaskById.description;
    document.querySelector("#iniInput").value = res.data.getTaskById.hour_ini;
    document.querySelector("#endInput").value = res.data.getTaskById.hour_end;
    document.querySelector('input[name="taskType"][value="' + res.data.getTaskById.type + '"]').checked = "true";
    document.querySelector("#userInput").value = res.data.getTaskById.user;
    document.querySelector("#inDay").value = res.data.getTaskById.in_day;
    document.querySelector("#finishedInput").checked =  res.data.getTaskById.finished;;
  });
}

fileForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const myFile = e.currentTarget.myFile.files[0];
  let postData = new FormData();
  postData.append("myFile", myFile);

  if (e.currentTarget.myFile.files.length > 0) {
    // Realiza la solicitud para subir el archivo
    fetch('http://localhost:3000/upload', {
      method: 'POST',
      body: postData
    })
    .then(response => {
      console.log(response);
      if (response.ok) {
        // El archivo se ha subido correctamente
        console.log("Response status:", response.status);
        return response.json();
      } else {
        // Hubo un error al subir el archivo
        throw new Error('Error al subir el archivo: ' + response.json());
      }
    })
    .then(response => response)
    .then(data => {
      socket.emit("importFile", "Se ha subido correctamente un archivo.");
    })
  }
  
  // Limpiar los valores del formulario
  fileForm.reset();

  // Cerrar el modal después de agregar la tarjeta
  const modal = document.querySelector("#fileTask");
  const modalInstance = bootstrap.Modal.getInstance(modal);
  modalInstance.hide();
});

fileModal.addEventListener("hidden.bs.modal", function (event) {
  // Eliminamos la clase "editing" de cualquier tarea que se haya editado
  const editingTask = document.querySelectorAll(".editing");
  for (let i = 0; i < editingTask.length; i++) {
    editingTask[i].classList.remove("editing");
  }
  // Mostramos el campo de añadir al día
  document.querySelector(".div-add-into").style.display = "block";
});