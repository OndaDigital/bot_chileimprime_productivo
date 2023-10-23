const GoogleSheetService = require("../../services/GoogleSheetService");
const googleSheetPedido = require("../../services/GoogleSheetPedidos");

const { addKeyword, EVENTS } = require('@bot-whatsapp/bot');

const googelSheet = new GoogleSheetService(
    "1zFKxknp8KJq5UgSDnNG9awr-HLEwZIdbb6jZlQkuwtk"
);

const googleSheetPedidos = new googleSheetPedido(
    "1zFKxknp8KJq5UgSDnNG9awr-HLEwZIdbb6jZlQkuwtk"
  );

module.exports = addKeyword(EVENTS.ACTION)
.addAction(async (ctx, {state, provider, flowDynamic, fallBack, gotoFlow}) => {
    const servicio_seleccionado = state.get('servicio_seleccionado');
    const precioPorUnidad = await googelSheet.obtenerPrecioPorNombre(servicio_seleccionado);
    if (!precioPorUnidad) {
        await fallBack("Error al obtener el precio. Por favor, inténtalo más tarde.");
        return;
    }

    await flowDynamic(`El producto *${servicio_seleccionado}* tiene un precio de $${precioPorUnidad} por unidad 🏷️

¿Deseas *subir la cotización o quieres finalizar* esta conversación? 🤔

*A.* Sí (Agilizará tu presupuesto. 🚀 Puedes enviarnos el diseño por correo o traerlo a la tienda después de subir la cotización).
*B.* No (Finalizar conversación) 🛑
`);

await state.update({precioPorUnidad: precioPorUnidad});

})
.addAction({ capture: true }, async (ctx, { state, flowDynamic, fallBack }) => {
    const servicio_seleccionado = state.get('servicio_seleccionado');
    const precio_por_unidad = state.get('precioPorUnidad');
    const respuesta = ctx.body.toUpperCase();
    if (respuesta === 'A') {
        await flowDynamic(`Perfecto, estamos subiendo tu cotizacion.`);

        //PReparamos el State para subir el formato deseado a google Sheet
        await state.update({
            anchoSeleccionado: 1,
            alturaSeleccionada: 1,
            areaTotal: 1,
            precioPorMetro: precio_por_unidad,
            precioTotal: precio_por_unidad,
            extra: "No",
            extra_precio: 0,
            DTE: "Boleta",
            precioTotalConExtra: precio_por_unidad,
            totalConIva: precio_por_unidad * 1.19,
            //Nombre, telefono y correo ya estan en el state

        });

        //Subimos el pedido a google sheet
        const pedido = state.getMyState();
        // Agrega el pedido a la hoja:
        const nuevoID = await googleSheetPedidos.agregarPedido(pedido);
        flowDynamic(`🖨 *COTIZACIÓN ${nuevoID}* 🖨

🔹 Producto/Servicio: 
- Tipo de Servicio: ${servicio_seleccionado}

🔹 Desglose de Costos:
- Precio por m2: ${numeroCLP(precio_por_unidad)}
- IVA 19%: ${numeroCLP(precio_por_unidad * 0.19)}

TOTAL A PAGAR: ${numeroCLP(precio_por_unidad * 1.19) } 
🚨 El precio anterior es solo referencial, para recibir la confirmacion por favor envia tu diseño a nuestro correo o traelo a la tienda.
🕐 Esta cotización es válida por 24 horas`);

  // Agregar espera de 5 segundos
  await new Promise(resolve => setTimeout(resolve, 5000));

  await flowDynamic(`✅ *Tu cotización ha sido cargada con éxito a nuestro sistema.*
🚨 *Recuerda* que no está completa, todavía debes venir a la *tienda con tu diseño o enviarlo por correo* para finalizar la cotización, en el proceso puedes agregar mas servicios o editar el actual.
🚨 *Es Obligatorio presentar la cotización* anterior al momento enviar el archivo.

🏬 *Tienda:* Av. El Parrón 579, La Cisterna.
⏰ *Horario:* 
- Lunes a Viernes: 09:30hrs - 18:30hrs
- Sábados: 09:30 - 16:00hrs
📧 *Correo:* chileimprime13@gmail.com
`);
  

 // Agregar espera de 2 segundos
 await new Promise(resolve => setTimeout(resolve, 10000));

 await flowDynamic(`❓ Si tienes dudas, escribe *hola* y marca la opcion 5 para hablar con un ejecutivo.`);


    } else if (respuesta === 'B') {       
         await flowDynamic("Entendido. Si cambias de opinión o necesitas más información, no dudes en contactarnos.");
        return;
    }
    else{
        await fallBack("Debes introducir una letra valida (A o B). Por favor, inténtalo de nuevo.");
    }
})

function numeroCLP(numbero) {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(numbero).replace("CLP", "").trim();
}