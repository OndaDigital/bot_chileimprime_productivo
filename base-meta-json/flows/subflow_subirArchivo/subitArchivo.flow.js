
const {addKeyword, EVENTS} = require('@bot-whatsapp/bot')



module.exports = addKeyword(EVENTS.ACTION).addAnswer("Inicio flujo de diseño*")
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

1. 📤 Subir el archivo por aquí y finalizar la cotización. (No disponible)
2. 📍 Venir a la tienda a finalizar la cotización pero con el archivo.
3. 📧 Enviar el archivo por correo.
4. 💼 Solicitar a nuestro diseñador un diseño por $15.000.`);
    
})
.addAction({ capture: true }, async (ctx, { state, flowDynamic, fallBack, gotoFlow }) => {
    const opcionSeleccionada = ctx.body;
    switch (opcionSeleccionada) {
        case "1":
            await fallBack("Estamos trabajando en esta caracteristica, intenta con otra opción (2, 3 o 4).");
            break;
        case "2":
            await flowDynamic("Perfecto, recuerda venir con tu diseño a la siguiente dirección:\n📍 *Av. El Parrón 579, La Cisterna* \n🕐 *Horarios de atención:* Lunes a sábados de 10am hasta las 18:00hrs.\nCorreo: chileimprime13.cl\nSitio web: chileimprime.cl");
            //await flowDynamic("Ahora  puedes subir tu diseño a la siguiente dirección: https://chileimprime.cl/subir-archivo/");
            await flowDynamic("Perfecto, tu orden ha sido subida a nuestro sistema, solo debes venir a la tienda con tu diseño, tienes 24 horas desde iniciada esta cotizacion");
            return await gotoFlow(flujoSubirPedido);
            break;
        case "3":
            await flowDynamic("Perfecto, envía tu diseño a chileimprime13@gmail.com y envia los detalles de tu cotización. te responderemos a la brevedad.");
            break;
        case "4":
            await fallBack("Nuestro diseñador no se encuentra disponible en este momento. Por favor, seleccona otra opción.");
            return;
        default:
            await fallBack("Opción no válida. Por favor, selecciona una opción de la lista (2, 3 o 4).");
            return;
    }
});
