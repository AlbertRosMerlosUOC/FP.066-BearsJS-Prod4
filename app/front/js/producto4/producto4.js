// Iniciamos el servicio de socket
let socket = io();

socket.on("showToast", (msg)=> {
  console.log(msg);
  goLiveToast();
});

function goLiveToast() {
  var myToast = document.getElementById("liveToast");
  var bsToast = new bootstrap.Toast(myToast);
  bsToast.show();
  setTimeout(function() {
      bsToast.hide();
  }, 5000);
}

// Seleccionar el formulario y el contenedor de la tarjeta
const form = document.querySelector("#myForm");
const cardContainer = document.querySelector("#cardContainer");
var content = "";

// Controlador de colores de fondo para poner la letra en blanco o negro
function checkDarkColor(color) {
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

// Agregar un escuchador de eventos para el formulario
form.addEventListener("submit", (event) => {
  // Prevenir que el formulario se envíe
  event.preventDefault();

  // Capturar los valores de los campos de entrada
  const week = document.querySelector("#weekInput").value;
  const year = document.querySelector("#yearInput").value;
  const desc = document.querySelector("#descInput").value;
  const type = document.querySelector(
    'input[name="workType"]:checked + label'
  ).textContent;
  const hourIni = document.querySelector("#iniInput").value;
  const hourEnd = document.querySelector("#endInput").value;
  const color = document.querySelector("#colorInput").value;
  const schedule =
    hourIni != "" && hourEnd != ""
      ? "de " + hourIni + " a " + hourEnd + "h"
      : "No especificadas horas de inicio y de fin";

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
        createWeek(
          week: ${week},
          year: ${year},
          description: "${desc}",
          hour_ini: "${hourIni}",
          hour_end: "${hourEnd}",
          type: "${type}",
          color: "${color}"
        ) {
          _id
          week
          year
          description
          hour_ini
          hour_end
          type
          color
        }
      }
    `,
    }),
  })
    .then((res) => res.json())
    .then((res) => {
      _id = res.data.createWeek._id;
      socket.emit("createWeek", "Se ha creado una nueva semana.");

      // Crear un nuevo elemento HTML para la tarjeta
      const card = document.createElement("div");
      card.classList.add("card");
      card.classList.add("cardWeek");
      card.style.backgroundColor = color;
      if (checkDarkColor(color.replace("#", ""))) {
        card.classList.add("cardWeekDark");
      } else {
        card.classList.add("cardWeekLight");
      }
      card.innerHTML = `
        <h4>Semana ${week} del año ${year}</h4>
        <p>${desc}</p>
        <p><b>Modalidad de trabajo:</b> ${type}</p>
        <p><b>Horario laboral:</b> ${schedule}</p>
        <div class="buttonsDiv">
          <button type="button" class="btn btn-success" onclick="window.location.href='./dashboard.html?_id=${_id}'"><i class="fa fa-search fa-lg"></i></button>
          <button type="button" class="btn btn-danger delete" id="delete" data-bs-toggle="modal" data-bs-target="#myModalQuit"><i class="fa fa-trash-o fa-lg"></i></button>
        </div>
      `;

      // Agregar la tarjeta al contenedor
      cardContainer.appendChild(card);

      // Limpiar los valores del formulario
      form.reset();

      // Cerrar el modal después de agregar la tarjeta
      const modal = document.querySelector("#myModal");
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance.hide();

      // Funcionalidad de quitar tarjeta (lanza modal de confirmacion)
      const quitCard = card.querySelector(".delete");

      quitCard.addEventListener("click", () => {
        const modalQuit = document.querySelector("#myModalQuit");
        const modalInstance = bootstrap.Modal.getInstance(modalQuit);
        modalInstance.show();

        // Funcionalidad de quitar tarjeta (elimina tarjeta)
        const deleteCard = document.querySelector("#deleteCard");
        deleteCard.addEventListener("click", () => {
          modalInstance.hide();
          if (card.parentNode) {
            tareaEliminada(card);
          }
        });
      });

      // Elimina el elemento padre del elemento que se haya seleccionado
      function tareaEliminada(element) {
        element.parentNode.removeChild(element);
      }
    });
});

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

function writeCard(item) {
  const schedule =
    item.hour_ini != "" && item.hour_end != ""
      ? "de " + item.hour_ini + " a " + item.hour_end + "h"
      : "No especificadas horas de inicio y de fin";
  const workMode = item.type == "T" ? "Teletrabajo" : "Presencial";

  const card = document.createElement("div");
  card.classList.add("card");
  card.classList.add("cardWeek");
  card.style.backgroundColor = item.color;
  if (checkDarkColor(item.color.replace("#", ""))) {
    card.classList.add("cardWeekDark");
  } else {
    card.classList.add("cardWeekLight");
  }
  card.innerHTML = `
    <h4>Semana ${item.week} del año ${item.year}</h4>
    <p>${item.description}</p>
    <p><b>Modalidad de trabajo:</b> ${workMode}</p>
    <p><b>Horario laboral:</b> ${schedule}</p>
    <div class="buttonsDiv">
      <button type="button" class="btn btn-success" onclick="window.location.href='./dashboard.html?_id=${item._id}'"><i class="fa fa-search fa-lg"></i></button>
      <button type="button" class="btn btn-danger delete" id="delete" data-bs-toggle="modal" data-bs-target="#myModalQuit"><i class="fa fa-trash-o fa-lg"></i></button>
    </div>
  `;

  // Agregar la tarjeta al contenedor
  cardContainer.appendChild(card);

  // Funcionalidad de quitar tarjeta (lanza modal de confirmacion)
  const quitCard = card.querySelector(".delete");

  quitCard.addEventListener("click", () => {
    const modalQuit = document.querySelector("#myModalQuit");
    const modalInstance = bootstrap.Modal.getInstance(modalQuit);
    modalInstance.show();

    // Funcionalidad de quitar tarjeta (elimina tarjeta)
    const deleteCard = document.querySelector("#deleteCard");
    deleteCard.addEventListener("click", () => {
      modalInstance.hide();
      if (card.parentNode) {
        tareaEliminada(card);
      }
    });
  });

  // Elimina el elemento padre del elemento que se haya seleccionado
  function tareaEliminada(element) {
    element.parentNode.removeChild(element);

    // Fetch para eliminar una tarea
    fetch("http://localhost:5000", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
        mutation {
          deleteWeek(
            _id: "${item._id}"
          ) {
            _id
          }
        }
      `,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        socket.emit("deleteWeek", "Se ha eliminado una semana.");
      });
  }
}

// Carga de datos inicial con conexión a MongoDB.
// Conexion al servidor GraphQl para la llamada getWeeks
fetch("http://localhost:5000", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    query: `{
      getWeeks {
        _id
        week
        year
        description
        hour_ini
        hour_end
        type
        color
      }
    }`,
  }),
})
  .then((res) => res.json())
  .then((res) => {
    res.data.getWeeks.map((item) => writeCard(item));
  });
