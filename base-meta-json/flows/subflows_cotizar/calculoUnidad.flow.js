const GoogleSheetService = require("../../services/GoogleSheetService");

const { addKeyword, EVENTS } = require('@bot-whatsapp/bot');

const googelSheet = new GoogleSheetService(
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

    await flowDynamic(`El producto *${servicio_seleccionado}* tiene un precio de $${precioPorUnidad} por unidad. 
¿Deseas continuar con el archivo de impresión o algún otro detalle? (Si/No)`);

})
.addAction({ capture: true }, async (ctx, { state, flowDynamic, fallBack }) => {
    const respuesta = ctx.body.toLowerCase();
    if (respuesta === 'si') {
        await flowDynamic(`Entendido. 

Por favor, envíanos el diseño para tu producto o cualquier detalle adicional que quieras agregar. Recuerda seguir las especificaciones de diseño adecuadas para el producto seleccionado.`);
    } else {
        await flowDynamic("Entendido. Si cambias de opinión o necesitas más información, no dudes en contactarnos.");
    }
})
.addAction({ capture: true }, async (ctx, { state, flowDynamic }) => {
    await flowDynamic(`Hemos recibido tu diseño. Nos pondremos en contacto contigo lo antes posible para confirmar los detalles de tu pedido. ¡Gracias!`);
});
