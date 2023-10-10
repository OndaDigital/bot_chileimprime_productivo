const GoogleSheetService = require( "../services/GoogleSheetService");
const chatgpt = require('../services/chatgpt.js');

const {addKeyword, EVENTS} = require('@bot-whatsapp/bot')

const googelSheet = new GoogleSheetService(
    "1zFKxknp8KJq5UgSDnNG9awr-HLEwZIdbb6jZlQkuwtk"
  );

const flujoUnidad = require('./unidad.flow');
const flujoFinalizar = require('./finalizar.flow');
const flujoIndicaciones = require('./indicacionesPostCalculo.flow').default;



const LETRAS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "Ñ", "O", "P", "Q"]; // y así sucesivamente

module.exports = addKeyword(EVENTS.ACTION)
.addAction(async (ctx, {state, provider, flowDynamic, fallBack, gotoFlow}) => {
    const servicio_seleccionado = state.get('servicio_seleccionado');
    const medidas = await googelSheet.consultarMedidasDisponibles(servicio_seleccionado);
    
    
    const tipo_producto = await googelSheet.obtenerTipoPorNombre(servicio_seleccionado);
    console.log(`Tipo: ${tipo_producto}`);
    //Si es un producto de tipo Rollo se lanza un flujo mas simple
    if(tipo_producto === 'Unidad')
    {
        await gotoFlow(flujoUnidad);
        return;
    }
    else
    {

        let anchosImprimibles = medidas.slice(1).map(medida => medida.imprimible);
        await state.update({ anchosImprimibles: anchosImprimibles });

        let mensaje_seleccion = `Para *${servicio_seleccionado}* selecciona la letra con el *ancho que deseas imprimir* y ten en cuenta el ancho total del rollo:\n\n`;
        anchosImprimibles.forEach((ancho, index) => {
            mensaje_seleccion += `*${LETRAS[index]}.* ${ancho} metros 🖨️ ( _ancho total ${medidas[index + 1].material}m_ )\n`;
        });
        await flowDynamic(mensaje_seleccion);    
    }
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
    const mensaje = `Seleccionaste: *${anchoSeleccionado} metros de ancho.*\n\nAhora, por favor *ingresa la altura en metros*\n(Ingresar un numero: ejemplo: *2.5*):`;
    await flowDynamic(mensaje);
})

.addAction({ capture: true }, async (ctx, { state, flowDynamic, fallBack, gotoFlow }) => {
    
    const alturaIngresada = ctx.body.replace(",", ".");
    if (isNaN(alturaIngresada) || alturaIngresada < 1) {
        await fallBack("Altura no válida. Por favor, ingresa un número mayor a *1 metro.*");
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
    await state.update({ precioTotal: precioTotal });
    await state.update({ precioPorMetro: precioPorMetro });

    // Saltamos la información detallada de la cotización y pasamos directamente a la pregunta
    await flowDynamic(`*¿Deseas agregar sellado o sellado y ojetillos?* 
     A. Sellado
     B. Sellado y ojetillos
     C. No \n
    `);

}).addAction({ capture: true }, async (ctx, { state, flowDynamic, fallBack, gotoFlow }) => {
    const opcionSeleccionada = ctx.body.toUpperCase();
    const precioTotal = await state.get('precioTotal');
    const anchoSeleccionado = await state.get('anchoSeleccionado');
    const alturaIngresada = await state.get('alturaSeleccionada');
    const precioPorMetro = await state.get('precioPorMetro');

    let costoExtra = 0;
    if (opcionSeleccionada === 'A') {
        costoExtra = 1000; // coste adicional por m2 para sellado
        await state.update({ extra: 'Sellado' });
        await state.update({ extra_precio: costoExtra });
        const precioTotalConExtra = precioTotal + (anchoSeleccionado * alturaIngresada * costoExtra);
        await state.update({ precioTotalConExtra: precioTotalConExtra });
        
    

        await flowDynamic(`🖨️ *Detalles de tu cotización* 🖨️

- Ancho: ${state.get('anchoSeleccionado')} metros
- Altura: ${state.get('alturaSeleccionada')} metros
📏 Servicio: PVC Alta Definición
💰 Precio por metro: $${precioPorMetro}
🔥 Precio Total: $${precioTotal}
🔥 Extras: Sellado por: ${costoExtra} el m2.
🔥 Precio Total con extras: ${precioTotalConExtra}
Esta cotización es válida por 24 horas. 

*Desea continuar con el archivo de impresión? (Si/No)*
        `);

        //await gotoFlow(flujoIndicaciones);

    } else if (opcionSeleccionada === 'B') {
        costoExtra = 2000; // coste adicional por m2 para sellado y ojetillos
        await state.update({ extra: 'Sellado y ojetillos' });
        await state.update({ extra_precio: costoExtra });
        const precioTotalConExtra = precioTotal + (anchoSeleccionado * alturaIngresada * costoExtra);
        await state.update({ precioTotalConExtra: precioTotalConExtra });

        await flowDynamic(`🖨️ *Detalles de tu cotización* 🖨️

- Ancho: ${state.get('anchoSeleccionado')} metros
- Altura: ${state.get('alturaSeleccionada')} metros
📏 Servicio: PVC Alta Definición
💰 Precio por metro: $${precioPorMetro}
🔥 Precio Total: $${precioTotal}
🔥 Extras: Sellado y ojetillos por: ${costoExtra} el m2.
🔥 Precio Total con extras: ${precioTotalConExtra}
Esta cotización es válida por 24 horas. 

*Desea continuar con el archivo de impresión? (Si/No)*
`);
        //await gotoFlow(flujoIndicaciones);

    } else if(opcionSeleccionada === 'C'){

        await state.update({ extra: 'No' });
        await state.update({ extra_precio: 0 });
        await state.update({ precioTotalConExtra: 0 });


await flowDynamic(`🖨️ *Detalles de tu cotización* 🖨️

- Ancho: ${state.get('anchoSeleccionado')} metros
- Altura: ${state.get('alturaSeleccionada')} metros
📏 Servicio: PVC Alta Definición
💰 Precio por metro: $${precioPorMetro}
🔥 Extras: No
🔥 Precio Total: $${precioTotal}
Esta cotización es válida por 24 horas. 

*Desea continuar con el archivo de impresión? (Si/No)*
`);
        //await gotoFlow(flujoIndicaciones);
    }
    
    else {
        await fallBack("Opción no válida. Por favor, selecciona A, B o C.");
        return;
    }

    
})
.addAction({ capture: true }, async (ctx, { state, flowDynamic, fallBack, gotoFlow }) => {
    const respuesta = ctx.body.toLowerCase();
    if (respuesta === 'si') {
        const anchoSeleccionado = state.get('anchoSeleccionado');
        const alturaIngresada = state.get('alturaSeleccionada');
        
        await flowDynamic(`Entendido. 

Primero, hablemos del diseño:

Tu diseño debe tener medidas exactas de *${anchoSeleccionado * 100} cm x ${alturaIngresada * 100} cm*. Esta es la dimensión que seleccionaste. Ahora, hablemos sobre los DPI (puntos por pulgada) y cómo afectan tu diseño. *¿Te parece bien?*`);
    } else {
        await flowDynamic("Entendido. Si cambias de opinión o necesitas más información, no dudes en contactarnos.");
        return;
    }
})
.addAction({ capture: true }, async (ctx, { state, flowDynamic, fallBack, gotoFlow }) => {
    const respuesta = ctx.body.toLowerCase();
    
    await flowDynamic(`Excelente.

Puedes ajustar los DPI de tu diseño para mejorar la calidad de impresión. A mayor DPI, mejor calidad, pero también mayor tamaño de archivo. Por ejemplo, si con 72DPI tu diseño pesa cerca de 100MB, al aumentar los DPI a 150, el tamaño puede subir a cerca de 200MB. Es esencial que ajustes cuidadosamente los DPI para no superar los 300MB permitidos.

Con eso en mente, ¿qué deseas hacer a continuación?

1. 📤 Subir el archivo por aquí y finalizar la cotización.
2. 📍 Venir a la tienda a finalizar la cotización pero con el archivo.
3. 📧 Enviar el archivo por correo.
4. 💼 Solicitar a nuestro diseñador un diseño por $15.000.`);
    
})
.addAction({ capture: true }, async (ctx, { state, flowDynamic, fallBack, gotoFlow }) => {
    const opcionSeleccionada = ctx.body;
    switch (opcionSeleccionada) {
        case "1":
            await gotoFlow(flujoIndicaciones);
            break;
        case "2":
            await flowDynamic("Perfecto, recuerda venir con tu diseño a la siguiente dirección:\n📍 *Av. El Parrón 579, La Cisterna* \n🕐 *Horarios de atención:* Lunes a sábados de 10am hasta las 18:00hrs.\nCorreo: chileimprime13.cl\nSitio web: chileimprime.cl");
            break;
        case "3":
            await flowDynamic("Perfecto, envía tu diseño a chileimprime13@gmail.com y envia los detalles de tu cotización. te responderemos a la brevedad.");
            break;
        case "4":
            await fallBack("Nuestro diseñador no se encuentra disponible en este momento. Por favor, seleccona otra opción.");
            return;
        default:
            await fallBack("Opción no válida. Por favor, selecciona una opción de la lista (1, 2, 3 o 4).");
            return;
    }
});