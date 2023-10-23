const GoogleSheetService = require( "../../services/GoogleSheetService");
const GoogleSheetPedidos = require('../../services/GoogleSheetPedidos');

const {addKeyword, EVENTS} = require("@bot-whatsapp/bot");

const googelSheet = new GoogleSheetService(
    "1zFKxknp8KJq5UgSDnNG9awr-HLEwZIdbb6jZlQkuwtk"
  );

  const googleSheetPedidos = new GoogleSheetPedidos(
    "1zFKxknp8KJq5UgSDnNG9awr-HLEwZIdbb6jZlQkuwtk"
  );

  const LETRAS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "Ñ", "O", "P", "Q"]; // y así sucesivamente
const flujoSubirPedido = require('./subirPedido.flow');

module.exports = addKeyword(EVENTS.ACTION)
.addAction(async (ctx, {state, provider, flowDynamic, fallBack, gotoFlow}) => {
    const servicio_seleccionado = await state.get('servicio_seleccionado');
    const medidas = await googelSheet.consultarMedidasDisponibles(servicio_seleccionado);
    let anchosImprimibles = medidas.slice(1).map(medida => medida.imprimible);
    let unidad_ancho;
    await state.update({ anchosImprimibles: anchosImprimibles });

    let mensaje_seleccion = `Para *${servicio_seleccionado}* selecciona la letra con el *ancho que deseas imprimir* y ten en cuenta el ancho total del rollo:\n\n`;
    anchosImprimibles.forEach((ancho, index) => {
        unidad_ancho = ancho === 1 ? 'metro' : 'metros';

        mensaje_seleccion += `*${LETRAS[index]}.* ${ancho} ${unidad_ancho} 🖨️ ( _ancho total ${medidas[index + 1].material}m_ )\n`;
    });

    await state.update({unidad_ancho: unidad_ancho});
     await flowDynamic(mensaje_seleccion);  
})
.addAction({ capture: true }, async (ctx, { state, flowDynamic, fallBack, gotoFlow }) => {
    const unidad_ancho = await state.get('unidad_ancho');
    const opcionSeleccionada = ctx.body.toUpperCase();
    const anchosImprimibles = state.get('anchosImprimibles');
    const indexSeleccionado = LETRAS.indexOf(opcionSeleccionada);

    if (indexSeleccionado === -1 || indexSeleccionado >= anchosImprimibles.length) {
        await fallBack("Opción no válida. Por favor, selecciona una letra de la lista.");
        return;
    }

    const anchoSeleccionado = anchosImprimibles[indexSeleccionado];
    await state.update({ anchoSeleccionado: anchoSeleccionado });
    const mensaje = `Seleccionaste: *${anchoSeleccionado} ${unidad_ancho} de ancho.* ✔️\n\nAhora, por favor *ingresa la altura en metros*\n(Ingresar un numero: ejemplo: *2.5*):`;
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
    //Obtener valores de ojetillo, sellado, bolsillo, etc
    const precioOjetillo = await googelSheet.obtenerPrecioOjetillo();
    const precioSellado = await googelSheet.obtenerPrecioSellado();
    const precioSelladoYOjetillos = await googelSheet.obtenerPrecioSelladoYOjetillos();
    const precioBolsillo = await googelSheet.obtenerPrecioBolsillo();
    
    //Los guardamos en el state
    await state.update({ precioOjetillo: precioOjetillo,
                        precioSellado: precioSellado,
                        precioSelladoYOjetillos: precioSelladoYOjetillos,
                        precioBolsillo: precioBolsillo
        });

    // Saltamos la información detallada de la cotización y pasamos directamente a la pregunta
    await flowDynamic(`*¿Deseas agregar alguna terminación adicional?* 
     A. Sellado - $${precioSellado} el m2
     B. Sellado y ojetillos - $${precioSelladoYOjetillos} el m2
     C. Bolsillo - $${precioBolsillo} el m2
     D. Ojetillo - $${precioOjetillo} el m2
     E. No \n
    `);

}).addAction({ capture: true }, async (ctx, { state, flowDynamic, fallBack }) => {
    const opcionSeleccionada = ctx.body.toUpperCase();
    const precioTotal = await state.get('precioTotal');
    const anchoSeleccionado = await state.get('anchoSeleccionado');
    const alturaIngresada = await state.get('alturaSeleccionada');
    const precioPorMetro = await state.get('precioPorMetro');
    const unidad_ancho = await state.get('unidad_ancho');
    const unidad_altura = (alturaIngresada === 1) ? "metro" : "metros";
    const servicio_seleccionado = await state.get('servicio_seleccionado');

    let costoExtra = 0;
    let extraDescription = "";

    const calculos = {
        'A': async () => {
            costoExtra = await state.get('precioSellado');
            console.log(`Precio sellado: ${costoExtra}`);
            extraDescription = 'Sellado';
        },
        'B': async () => {
            costoExtra = await state.get('precioSelladoYOjetillos');
            console.log(`Precio sellado y ojetillos: ${costoExtra}`);
            extraDescription = 'Sellado y ojetillos';
        },
        'C': async () => {
            costoExtra = await state.get('precioBolsillo');
            console.log(`Precio Bolsillo: ${costoExtra}`);
            extraDescription = 'Bolsillo';
        },
        'D': async () => {
            costoExtra = await state.get('precioOjetillo');
            console.log(`Precio Ojetillo: ${costoExtra}`);
            extraDescription = 'Ojetillo';
        },
        'E': async () => {
            costoExtra = 0;
            extraDescription = 'No';
        }
    };

    if (calculos[opcionSeleccionada]) {
        await calculos[opcionSeleccionada]();

        //Preparamos los datos para exportar al excel.
        const areaTotal = redondear(anchoSeleccionado * alturaIngresada);
        const DTE = "Boleta";
        
        const precioTotalConExtra = precioTotal + (anchoSeleccionado * alturaIngresada * costoExtra);
        const iva19porciento = precioTotalConExtra * 0.19;
        const totalConIva = precioTotalConExtra + iva19porciento;

        await state.update({ 
            extra: extraDescription, 
            extra_precio: costoExtra, 
            precioTotalConExtra: precioTotalConExtra,
            areaTotal: areaTotal, 
            DTE: DTE,
            totalConIva: totalConIva,
        });

        //Subimos el pedido a google sheet
        const pedido = state.getMyState();
        // Agrega el pedido a la hoja:
        const nuevoID = await googleSheetPedidos.agregarPedido(pedido);

        await flowDynamic(generarDetallesCotizacion({
            servicio_seleccionado,
            anchoSeleccionado,
            unidad_ancho,
            alturaIngresada,
            unidad_altura,
            costoExtra,
            precioPorMetro,
            precioTotal,
            precioTotalConExtra,
            iva19porciento,
            totalConIva,
            extraDescription,
            nuevoID

        }));

        
        // await gotoFlow(flujoIndicaciones);
    } else {
        await fallBack("Opción no válida. Por favor, selecciona A, B, C, D o E");
        return;
    }
})
.addAction(async(ctx,{flowDynamic, state, fallBack, gotoFlow}) => {

      // Agregar espera de 10 segundos
      await new Promise(resolve => setTimeout(resolve, 5000));

      await flowDynamic(`✅ *Tu cotización ha sido cargada con éxito a nuestro sistema.*
🚨 *Recuerda* que no está completa, todavía debes venir a la *tienda con tu diseño o enviarlo por correo* para finalizar la cotización.
🚨 *Es Obligatorio presentar la cotización* anterior al momento de venir a la tienda o de enviar el diseño al correo.

🏬 *Tienda:* Av. El Parrón 579, La Cisterna.
⏰ *Horario:* 
- Lunes a Viernes: 09:30hrs - 18:30hrs
- Sábados: 09:30 - 16:00hrs
📧 *Correo:* chileimprime13@gmail.com
`);
      

     // Agregar espera de 2 segundos
     await new Promise(resolve => setTimeout(resolve, 10000));

     await flowDynamic(`❓ Si tienes dudas, escribe *hola* y marca la opcion 5 para hablar con un ejecutivo.`);

    
})


function numeroCLP(numbero) {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(numbero).replace("CLP", "").trim();
}

//Redondear a 2 decimeales
function redondear(numero) {
    return Math.round(numero * 100) / 100;
}


function generarDetallesCotizacion(data) {
    let mensaje = `🖨️ * COTIZACIÓN ${data.nuevoID} * 🖨️\n\n`;

    // Producto/Servicio
    mensaje += `🔹 *Producto/Servicio:*\n`;
    mensaje += `- Tipo de Servicio: ${data.servicio_seleccionado}\n`;
    mensaje += `- Ancho del rollo: ${data.anchoSeleccionado} ${data.unidad_ancho}\n`;
    mensaje += `- Altura: ${data.alturaIngresada} ${data.unidad_altura}\n`;
    mensaje += `- Área total: ${redondear(data.anchoSeleccionado * data.alturaIngresada)} m2\n`;

    // Si hay extras, mostramos los detalles
    if (data.extraDescription !== 'No') {
        mensaje += `- Extra: ${data.extraDescription} por ${numeroCLP(data.costoExtra)} el m2.\n`;
    }

    // Desglose de Costos
    mensaje += `\n🔹 *Desglose de Costos:*\n`;
    mensaje += `- Precio por m2: ${numeroCLP(data.precioPorMetro)}\n`;
    
    if (data.extraDescription !== 'No') {
        mensaje += `- Subtotal sin extras: ${numeroCLP(data.precioTotal)}\n`;
        mensaje += `- Total extras: ${numeroCLP(data.anchoSeleccionado * data.alturaIngresada * data.costoExtra)}\n`;
        mensaje += `- Subtotal con extras: ${numeroCLP(data.precioTotalConExtra)}\n`;
    } else {
        mensaje += `- Subtotal: ${numeroCLP(data.precioTotal)}\n`;
    }

    mensaje += `- IVA 19%: ${numeroCLP(data.iva19porciento)}\n\n`;

    mensaje += `*TOTAL A PAGAR:* ${numeroCLP(data.totalConIva)}\n\n`;

    mensaje += `🕐 Esta cotización es válida por 24 horas.`;

    return mensaje;
}
