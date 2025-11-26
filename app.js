// ---------------------- 1. VALIDACIÓN FORMULARIO REGISTRO -------------------

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    const nombreInput = document.getElementById("nombre");
    const correoInput = document.getElementById("correo");
    const passInput = document.getElementById("contrasena");
    const terminosCheck = document.getElementById("terminos");
    const continuarBtn = document.getElementById("continuar-btn");

    // Si no estamos en la página con este formulario, salimos
    if (!form || !nombreInput || !correoInput || !passInput || !terminosCheck || !continuarBtn) {
        return;
    }

    const crearMensaje = (id, afterEl) => {
        let el = document.getElementById(id);
        if (!el) {
            el = document.createElement("div");
            el.id = id;
            el.style.fontSize = "0.9rem";
            el.style.marginTop = "6px";
            el.style.color = "#b00020";
            afterEl.insertAdjacentElement("afterend", el);
        }
        return el;
    };

    const nombreMsg = crearMensaje("nombre-msg", nombreInput);
    const correoMsg = crearMensaje("correo-msg", correoInput);
    const passMsg = crearMensaje("pass-msg", passInput);
    const terminosMsg = crearMensaje("terminos-msg", terminosCheck.parentElement);

    let listaCriterios = document.getElementById("pass-criteria");
    if (!listaCriterios) {
        listaCriterios = document.createElement("ul");
        listaCriterios.id = "pass-criteria";
        listaCriterios.style.fontSize = "0.85rem";
        listaCriterios.style.marginTop = "8px";
        listaCriterios.style.paddingLeft = "18px";
        listaCriterios.style.color = "#444";
        passInput.insertAdjacentElement("afterend", listaCriterios);
    }

    const criterios = [
        { id: "len", texto: "Mínimo 8 caracteres", test: v => v.length >= 8 },
        { id: "may", texto: "Al menos 1 mayúscula (A-Z)", test: v => /[A-Z]/.test(v) },
        { id: "min", texto: "Al menos 1 minúscula (a-z)", test: v => /[a-z]/.test(v) },
        { id: "num", texto: "Al menos 1 número (0-9)", test: v => /\d/.test(v) },
        { id: "sym", texto: "Al menos 1 símbolo (!@#..)", test: v => /[^A-Za-z0-9]/.test(v) },
    ];

    listaCriterios.innerHTML = criterios
        .map(c => `<li id="crit-${c.id}">⬜ ${c.texto}</li>`)
        .join("");

    const actualizarCriterio = (id, ok) => {
        const li = document.getElementById(`crit-${id}`);
        if (!li) return;
        const texto = li.textContent.replace(/^.*? /, "");
        li.textContent = `${ok ? "✅" : "⬜"} ${texto}`;
        li.style.color = ok ? "green" : "#444";
    };

    const validarPassword = () => {
        const pass = passInput.value.trim();
        let valido = true;

        criterios.forEach(c => {
            const cumple = c.test(pass);
            actualizarCriterio(c.id, cumple);
            if (!cumple) valido = false;
        });

        passMsg.textContent = valido ? "" : "La contraseña no cumple todos los criterios.";
        return valido;
    };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const validarCorreo = () => {
        const valor = correoInput.value.trim();
        let mensaje = "";

        if (!valor) {
            mensaje = "Debes ingresar un correo electrónico.";
        } else if (!emailRegex.test(valor)) {
            mensaje = "Ingresa un correo electrónico válido.";
        }

        correoMsg.textContent = mensaje;
        return mensaje === "";
    };

    const validarNombre = () => {
        const ok = nombreInput.value.trim().length > 0;
        nombreMsg.textContent = ok ? "" : "Debes ingresar tu nombre completo.";
        return ok;
    };

    const validarTerminos = () => {
        const ok = terminosCheck.checked;
        terminosMsg.textContent = ok
            ? ""
            : "Debes aceptar los términos y condiciones para continuar.";
        return ok;
    };

    passInput.addEventListener("input", validarPassword);
    nombreInput.addEventListener("input", validarNombre);
    correoInput.addEventListener("input", validarCorreo);
    terminosCheck.addEventListener("change", validarTerminos);

    continuarBtn.addEventListener("click", (e) => {
        e.preventDefault();

        const nombreOk = validarNombre();
        const correoOk = validarCorreo();
        const passOk = validarPassword();
        const terminosOk = validarTerminos();

        if (nombreOk && correoOk && passOk && terminosOk) {
            window.location.href = continuarBtn.getAttribute("href");
        }
    });

    form.addEventListener("submit", e => e.preventDefault());
});

// --------------------2. BÚSQUEDA DE TRABAJADORES ------------------------------

document.addEventListener("DOMContentLoaded", () => {
    const ubicacionInput = document.getElementById("ubicacion");
    const habilidadesInput = document.getElementById("habilidades");
    const edadInput = document.getElementById("edad");
    const btnLimpiar = document.getElementById("btnLimpiar");
    const btnBuscar = document.getElementById("btnBuscar");

    // Si no existe el bloque de búsqueda, salimos
    if (!ubicacionInput || !habilidadesInput || !edadInput || !btnLimpiar || !btnBuscar) return;

    const cards = Array.from(document.querySelectorAll(".busqueda-card"));

    let mensajeBox = document.getElementById("busquedaMensaje");
    if (!mensajeBox) {
        mensajeBox = document.createElement("div");
        mensajeBox.id = "busquedaMensaje";
        mensajeBox.style.display = "none";
        mensajeBox.style.marginTop = "12px";
        mensajeBox.style.padding = "12px";
        mensajeBox.style.borderRadius = "8px";
        mensajeBox.style.background = "#f7f7f7";
        mensajeBox.style.border = "1px solid #ddd";
        mensajeBox.style.fontSize = "0.95rem";

        const actions = document.querySelector(".busqueda__actions");
        if (actions) {
            actions.insertAdjacentElement("afterend", mensajeBox);
        } else {
            document.body.appendChild(mensajeBox);
        }
    }

    const normalizar = (str) => (str || "").toString().trim().toLowerCase();

    const limpiarCampos = () => {
        ubicacionInput.value = "";
        habilidadesInput.value = "";
        edadInput.value = "";
    };

    const ocultarMensaje = () => {
        mensajeBox.style.display = "none";
        mensajeBox.innerHTML = "";
    };

    const mostrarMensajeSinResultados = () => {
        mensajeBox.innerHTML = `
      <p style="margin:0 0 8px 0;">
        No se encontraron trabajadores con esos filtros.
      </p>
      <button id="btnVolverInicio" class="busqueda__btn">
        Volver al inicio
      </button>
    `;
        mensajeBox.style.display = "block";

        const btnVolverInicio = document.getElementById("btnVolverInicio");
        if (btnVolverInicio) {
            btnVolverInicio.addEventListener("click", (e) => {
                e.preventDefault();
                cards.forEach(card => {
                    card.style.display = "";
                });
                limpiarCampos();
                ocultarMensaje();
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        }
    };

    const buscarTrabajadores = ({ ubicacion, habilidades, edad }) => {
        let encontrados = 0;

        cards.forEach(card => {
            const textoCard = normalizar(card.innerText);

            const coincideUbicacion = !ubicacion || textoCard.includes(ubicacion);
            const coincideHabilidades = !habilidades || textoCard.includes(habilidades);

            const coincideEdad =
                !edad ||
                textoCard.includes(`${edad} años`) ||
                textoCard.includes(`${edad} año`);

            const mostrar = coincideUbicacion && coincideHabilidades && coincideEdad;
            card.style.display = mostrar ? "" : "none";

            if (mostrar) encontrados++;
        });

        return encontrados;
    };

    btnBuscar.addEventListener("click", (e) => {
        e.preventDefault();
        ocultarMensaje();

        const filtros = {
            ubicacion: normalizar(ubicacionInput.value),
            habilidades: normalizar(habilidadesInput.value),
            edad: edadInput.value ? Number(edadInput.value) : null
        };

        const totalEncontrados = buscarTrabajadores(filtros);

        if (totalEncontrados === 0) {
            mostrarMensajeSinResultados();
        }

        limpiarCampos();
    });

    btnLimpiar.addEventListener("click", (e) => {
        e.preventDefault();
        limpiarCampos();
        cards.forEach(card => {
            card.style.display = "";
        });
        ocultarMensaje();
    });
});

// ------------------ 3. PUBLICAR OFERTA + AVISO PUBLICADA -----------------------

document.addEventListener("DOMContentLoaded", () => {
    const flagPublicada = sessionStorage.getItem("mostrarAvisoPublicada") === "1";
    const enOfertas = window.location.pathname.includes("ofertas.html");

    const alertOverlay = document.getElementById("alertOverlay");
    const alertMsg = document.getElementById("alertMsg");
    const alertBtn = document.getElementById("alertBtn");

    // Mostrar aviso al regresar a ofertas
    if (flagPublicada && enOfertas && alertOverlay && alertMsg && alertBtn) {
        alertMsg.textContent =
            "Su oferta ya está disponible para las personas ideales para ese cargo.";
        alertOverlay.classList.add("show");
        alertBtn.onclick = () => alertOverlay.classList.remove("show");
        sessionStorage.removeItem("mostrarAvisoPublicada");
    }

    const form = document.getElementById("form-publicar");
    if (!form || !alertOverlay || !alertMsg || !alertBtn) return;

    const alertBox = alertOverlay.querySelector(".alert-box");
    const originalOkBtn = alertBtn;

    const focusableSelector =
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    let lastFocusedAlert = null;

    const handleAlertKeydown = (e) => {
        if (!alertOverlay.classList.contains("show")) return;

        if (e.key === "Escape") {
            e.preventDefault();
            closeOverlay();
        }

        if (e.key === "Tab") {
            const focusable = Array.from(alertOverlay.querySelectorAll(focusableSelector))
                .filter(el => !el.hasAttribute("disabled") && el.offsetParent !== null);
            if (!focusable.length) return;

            const currentIndex = focusable.indexOf(document.activeElement);
            let nextIndex = currentIndex;

            if (e.shiftKey) {
                nextIndex = currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1;
            } else {
                nextIndex = currentIndex === focusable.length - 1 ? 0 : currentIndex + 1;
            }

            focusable[nextIndex].focus();
            e.preventDefault();
        }
    };

    const openOverlay = () => {
        lastFocusedAlert = document.activeElement;
        alertOverlay.classList.add("show");

        const focusable = alertOverlay.querySelectorAll(focusableSelector);
        if (focusable.length) {
            focusable[0].focus();
        }

        document.addEventListener("keydown", handleAlertKeydown);
    };

    const closeOverlay = () => {
        alertOverlay.classList.remove("show");
        document.removeEventListener("keydown", handleAlertKeydown);
        if (lastFocusedAlert) lastFocusedAlert.focus();
    };

    const showAlert = (msg) => {
        alertMsg.textContent = msg;
        const old = alertBox.querySelector(".confirm-actions");
        if (old) old.remove();
        originalOkBtn.style.display = "inline-flex";
        originalOkBtn.textContent = "OK";
        openOverlay();
    };

    originalOkBtn.addEventListener("click", closeOverlay);
    alertOverlay.addEventListener("click", (e) => {
        if (e.target === alertOverlay) closeOverlay();
    });

    const showConfirm = (msg, onYes) => {
        alertMsg.textContent = msg;
        originalOkBtn.style.display = "none";

        const old = alertBox.querySelector(".confirm-actions");
        if (old) old.remove();

        const actions = document.createElement("div");
        actions.className = "confirm-actions";
        actions.style.display = "flex";
        actions.style.justifyContent = "center";
        actions.style.gap = "12px";
        actions.style.marginTop = "8px";

        const yesBtn = document.createElement("button");
        yesBtn.type = "button";
        yesBtn.className = "alert-btn";
        yesBtn.textContent = "Sí";

        const noBtn = document.createElement("button");
        noBtn.type = "button";
        noBtn.className = "alert-btn";
        noBtn.textContent = "No";

        actions.appendChild(yesBtn);
        actions.appendChild(noBtn);
        alertBox.appendChild(actions);

        yesBtn.addEventListener(
            "click",
            () => {
                closeOverlay();
                onYes();
            },
            { once: true }
        );
        noBtn.addEventListener("click", closeOverlay, { once: true });

        openOverlay();
    };

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const titulo = document.getElementById("titulo")?.value.trim();
        const descripcion = document.getElementById("descripcion")?.value.trim();
        const requisitos = document.getElementById("requisitos")?.value.trim();
        const salario = document.getElementById("salario")?.value.trim();
        const num = document.getElementById("num")?.value.trim();
        const fecha = document.getElementById("fecha")?.value.trim();

        if (!titulo || !descripcion || !requisitos || !salario || !num || !fecha) {
            showAlert("Por favor, completa todos los campos antes de publicar la oferta.");
            return;
        }

        const regexFecha = /^\d{2}\/\d{2}\/\d{4}$/;
        if (!regexFecha.test(fecha)) {
            showAlert("La fecha debe tener el formato dd/mm/aaaa.");
            return;
        }

        // Validación de fecha de calendario real
        const [diaStr, mesStr, anioStr] = fecha.split("/");
        const dia = Number(diaStr);
        const mes = Number(mesStr);
        const anio = Number(anioStr);

        const fechaObj = new Date(anio, mes - 1, dia);
        const fechaValida =
            fechaObj.getFullYear() === anio &&
            fechaObj.getMonth() === mes - 1 &&
            fechaObj.getDate() === dia;

        if (!fechaValida) {
            showAlert("La fecha ingresada no es válida.");
            return;
        }

        showConfirm("¿Estás seguro de realizar la publicación de la oferta?", () => {
            sessionStorage.setItem("mostrarAvisoPublicada", "1");
            window.location.href = "./ofertas.html";
        });
    });
});

// -------------------- 4. BOTÓN SALIR (VOLVER A INICIO) ------------------------

document.addEventListener("DOMContentLoaded", () => {
    const exitBtn = document.querySelector(".exit-btn");
    if (!exitBtn) return;

    exitBtn.addEventListener("click", () => {
        window.location.href = "../index.html";
    });
});

// ---------------- 5. ALERTA FINALIZAR OFERTA (mis-ofertas) ---------------------------

document.addEventListener("DOMContentLoaded", () => {
    const finalizarLinks = document.querySelectorAll(".mis-ofertas__finalizar");
    if (!finalizarLinks.length) return;

    const overlay = document.createElement("div");
    overlay.className = "alert-overlay";
    overlay.innerHTML = `
    <div class="alert-box" role="dialog" aria-modal="true" aria-labelledby="alertTitle">
      <h3 id="alertTitle" class="alert-title">¿Finalizar oferta?</h3>
      <p class="alert-message">¿Estás seguro de que deseas finalizar esta oferta?</p>
      <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
        <button type="button" class="alert-btn alert-btn--no">No</button>
        <button type="button" class="alert-btn alert-btn--yes">Sí</button>
      </div>
    </div>
  `;
    document.body.appendChild(overlay);

    const btnNo = overlay.querySelector(".alert-btn--no");
    const btnYes = overlay.querySelector(".alert-btn--yes");

    let destinoHref = "./contenido/fin-oferta.html";
    let lastFocused = null;

    const focusableSelector =
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    const onKeydown = (e) => {
        if (!overlay.classList.contains("show")) return;

        if (e.key === "Escape") {
            e.preventDefault();
            cerrarAlerta();
        }

        if (e.key === "Tab") {
            const focusable = Array.from(overlay.querySelectorAll(focusableSelector))
                .filter(el => !el.hasAttribute("disabled") && el.offsetParent !== null);
            if (!focusable.length) return;

            const currentIndex = focusable.indexOf(document.activeElement);
            let nextIndex = currentIndex;

            if (e.shiftKey) {
                nextIndex = currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1;
            } else {
                nextIndex = currentIndex === focusable.length - 1 ? 0 : currentIndex + 1;
            }

            focusable[nextIndex].focus();
            e.preventDefault();
        }
    };

    const abrirAlerta = (href) => {
        destinoHref = href || destinoHref;
        lastFocused = document.activeElement;
        overlay.classList.add("show");
        btnNo.focus();
        document.addEventListener("keydown", onKeydown);
    };

    const cerrarAlerta = () => {
        overlay.classList.remove("show");
        document.removeEventListener("keydown", onKeydown);
        if (lastFocused) lastFocused.focus();
    };

    finalizarLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            abrirAlerta(link.getAttribute("href"));
        });
    });

    btnNo.addEventListener("click", cerrarAlerta);
    btnYes.addEventListener("click", () => {
        window.location.href = destinoHref;
    });

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) cerrarAlerta();
    });
});

// --------------------- 6. fin-oferta.html → guarda fecha fin en localStorage ---------------------

document.addEventListener("DOMContentLoaded", () => {
    if (!window.location.pathname.includes("fin-oferta.html")) return;

    const btnVolver = document.querySelector(".seleccion-persona__btn");
    if (!btnVolver) return;

    btnVolver.addEventListener("click", (e) => {
        e.preventDefault();

        const hoy = new Date();
        const dia = String(hoy.getDate()).padStart(2, "0");
        const mes = String(hoy.getMonth() + 1).padStart(2, "0");
        const año = String(hoy.getFullYear()).slice(2);

        const fechaTexto = `${dia}/${mes}/${año}`;
        localStorage.setItem("fechaFinOferta", fechaTexto);
        window.location.href = "./lista-oferta.html";
    });
});

// ----------- 7. lista-oferta.html → marcar ofertas finalizadas + bloquear revisión -----------

document.addEventListener("DOMContentLoaded", () => {
    if (!window.location.pathname.includes("lista-oferta.html")) return;

    const fechaGuardada = localStorage.getItem("fechaFinOferta");

    // Si viene una fecha desde fin-oferta.html, finalizamos ofertas activas
    if (fechaGuardada) {
        const botonesFinalizar = document.querySelectorAll(".mis-ofertas__finalizar");

        botonesFinalizar.forEach((btn) => {
            const fila = btn.closest("tr");
            if (!fila) return;

            const celdaEstado = fila.querySelector(".mis-ofertas__estado");
            if (celdaEstado) celdaEstado.textContent = "Finalizada";

            const celdaFinalizar = btn.parentElement;
            if (celdaFinalizar) {
                celdaFinalizar.textContent = fechaGuardada;
                celdaFinalizar.classList.add("mis-ofertas__fecha");
            }
        });

        localStorage.removeItem("fechaFinOferta");
    }

    const botonesFinalizarRestantes = document.querySelectorAll(".mis-ofertas__finalizar");

    // Si ya no quedan ofertas por finalizar, bloqueamos los botones de revisar
    if (botonesFinalizarRestantes.length === 0) {
        const botonesRevisar = document.querySelectorAll(".btn-dark--review");
        botonesRevisar.forEach(btn => {
            btn.classList.add("disabled-review");
            btn.style.pointerEvents = "none";
            btn.style.opacity = "0.5";
        });
    }
});

// -------------------- 8. VALIDACIÓN CAMPOS OBLIGATORIOS --------------

document.addEventListener("DOMContentLoaded", () => {
    const focusableSelector =
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    // Función reutilizable para cualquier botón que deba verificar campos completos
    const initRequiredFieldsAlert = (buttonSelector) => {
        const btnContinuar = document.querySelector(buttonSelector);
        if (!btnContinuar) return;

    
        let overlay = document.querySelector(".alert-overlay.alert-overlay--required");
        if (!overlay) {
            overlay = document.createElement("div");
            overlay.className = "alert-overlay alert-overlay--required";
            overlay.innerHTML = `
        <div class="alert-box" role="alertdialog" aria-modal="true">
          <h3 class="alert-title">Atención</h3>
          <p class="alert-message"></p>
          <button class="alert-btn" type="button">Entendido</button>
        </div>
      `;
            document.body.appendChild(overlay);
        }

        const alertMsg = overlay.querySelector(".alert-message");
        const alertBtn = overlay.querySelector(".alert-btn");
        let lastFocused = null;

        const handleKeydown = (e) => {
            if (!overlay.classList.contains("show")) return;

            if (e.key === "Escape") {
                e.preventDefault();
                hideAlert();
            }

            if (e.key === "Tab") {
                const focusable = Array.from(overlay.querySelectorAll(focusableSelector))
                    .filter(el => !el.hasAttribute("disabled") && el.offsetParent !== null);
                if (!focusable.length) return;

                const currentIndex = focusable.indexOf(document.activeElement);
                let nextIndex = currentIndex;

                if (e.shiftKey) {
                    nextIndex = currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1;
                } else {
                    nextIndex = currentIndex === focusable.length - 1 ? 0 : currentIndex + 1;
                }

                focusable[nextIndex].focus();
                e.preventDefault();
            }
        };

        const showAlert = (message) => {
            lastFocused = document.activeElement;
            alertMsg.textContent = message;
            overlay.classList.add("show");
            alertBtn.focus();
            document.addEventListener("keydown", handleKeydown);
        };

        const hideAlert = () => {
            overlay.classList.remove("show");
            document.removeEventListener("keydown", handleKeydown);
            if (lastFocused) lastFocused.focus();
        };

        alertBtn.addEventListener("click", hideAlert);
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) hideAlert();
        });

        btnContinuar.addEventListener("click", (e) => {
            const campos = document.querySelectorAll("input, textarea");
            let formularioCompleto = true;

            campos.forEach(campo => {
                if (campo.type !== "file" && campo.value.trim() === "") {
                    formularioCompleto = false;
                }
                if (campo.type === "file" && campo.files.length === 0) {
                    formularioCompleto = false;
                }
            });

            if (!formularioCompleto) {
                e.preventDefault();
                showAlert("Todos los campos deben estar completos para continuar");
            }
        });
    };


    initRequiredFieldsAlert(".btn-continuar");
    initRequiredFieldsAlert(".btn");
});
