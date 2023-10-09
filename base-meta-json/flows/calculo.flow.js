const GoogleSheetService = require( "../services/GoogleSheetService");
const chatgpt = require('../services/chatgpt.js');

const {addKeyword, EVENTS} = require('@bot-whatsapp/bot')

const googelSheet = new GoogleSheetService(
    "1zFKxknp8KJq5UgSDnNG9awr-HLEwZIdbb6jZlQkuwtk"
  );
const flujoFinalizar = require('./finalizar.flow');
const flujoIndicaciones = require('./indicacionesPostCalculo.flow');


const LETRAS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "Ñ", "O", "P", "Q"]; // y así sucesivamente

module.exports = addKeyword(EVENTS.ACTION)
.addAction(async (ctx, {state, provider, flowDynamic, fallBack, gotoFlow}) => {
    const servicio_seleccionado = state.get('servicio_seleccionado');
    const medidas = await googelSheet.consultarMedidasDisponibles(servicio_seleccionado);

    let mensaje = `A continuación tenemos los siguientes anchos disponbies para ${servicio_seleccionado}:\n`;
    let anchosImprimibles = medidas.slice(1).map(medida => {
        mensaje += `Material: ${medida.material}, Imprimible: ${medida.imprimible}\n`;
        return medida.imprimible;
    });

    await state.update({ anchosImprimibles: anchosImprimibles });
    await flowDynamic(mensaje);

    let mensaje_seleccion = "Escoge la opción con el ancho deseado:\n";
    anchosImprimibles.forEach((ancho, index) => {
        mensaje_seleccion += `${LETRAS[index]}). ${ancho} metros\n`;
    });
    await flowDynamic(mensaje_seleccion);
    
})
.addAction({ capture: true }, async (ctx, { state, flowDynamic, fallBack, gotoFlow }) => {
    const opcionSeleccionada = ctx.body.toUpperCase();
    const anchosImprimibles = state.get('anchosImprimibles');
    const indexSeleccionado = LETRAS.indexOf(opcionSeleccionada);

    if (indexSeleccionado === -1 || indexSeleccionado >= anchosImprimibles.length) {
        await fallBack("Opción no válida. Por favor, selecciona una letra de la lista.");
        return;
    }

    const anchoSeleccionado = anchosImprimibles[indexSeleccionado];
    await state.update({ anchoSeleccionado: anchoSeleccionado });
    const mensaje = `Seleccionaste: *${anchoSeleccionado}* metros.\nAhora, por favor ingresa la altura en metros (ejemplo: 2.5):`;
    await flowDynamic(mensaje);
})
.addAction({ capture: true }, async (ctx, { state, flowDynamic, fallBack, gotoFlow }) => {
    
    const alturaIngresada = ctx.body.replace(",", ".");
    if (isNaN(alturaIngresada) || alturaIngresada <= 0) {
        await fallBack("Altura no válida. Por favor, ingresa un número positivo.");
        return;
    }
    await state.update({ alturaSeleccionada: alturaIngresada });

    // Calculamos el precio total
    const anchoSeleccionado = parseFloat(state.get('anchoSeleccionado')); 
    const servicio_seleccionado = state.get('servicio_seleccionado');
    const precioPorMetro = await googelSheet.obtenerPrecioPorNombre(servicio_seleccionado);
    if (!precioPorMetro) {
        await fallBack("Error al obtener el precio. Por favor, inténtalo más tarde.");
        return;
    }

    const precioTotal = anchoSeleccionado * alturaIngresada * parseFloat(precioPorMetro);
    const precioFormateado = precioTotal.toLocaleString('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
    
    await flowDynamic(`
    *📄 COTIZACIÓN FINALIZADA*\n
    📏 *Dimensiones:*
    - Ancho: *${anchoSeleccionado} metros*
    - Altura: *${alturaIngresada} metros*\n
    🛍️ *Servicio*: *${servicio_seleccionado}*\n
    💰 *Precio por metro*: *${parseFloat(precioPorMetro).toLocaleString('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    })}*\n
    🔥 *Precio Total*: ${precioFormateado}\n
¿Desea agregar sellado u ojetillos? Si, No \n
    `);

    

    await gotoFlow(flujoIndicaciones);
});