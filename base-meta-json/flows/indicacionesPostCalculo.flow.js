const GoogleSheetService = require( "../services/GoogleSheetService");
const chatgpt = require('../services/chatgpt.js');
const {addKeyword, EVENTS} = require('@bot-whatsapp/bot');
const googelSheet = new GoogleSheetService("1zFKxknp8KJq5UgSDnNG9awr-HLEwZIdbb6jZlQkuwtk");
const flujoFinalizar = require('./finalizar.flow');

module.exports = addKeyword(EVENTS.ACTION)
.addAction({capture:true},async (ctx, {state, flowDynamic,gotoFlow}) => {
    const anchoSeleccionado = parseFloat(state.get('anchoSeleccionado'));
    const alturaSeleccionada = parseFloat(state.get('alturaSeleccionada'));
    const anchoCm = (anchoSeleccionado * 100).toFixed(0);
    const alturaCm = (alturaSeleccionada * 100).toFixed(0);

    let mensaje = `Vamos a imprimir un diseño de *${anchoSeleccionado}m x ${alturaSeleccionada}m* (${anchoCm}cm x ${alturaCm}cm). Por favor considera:\n\n`;
    mensaje += "1. Diseño con dimensiones exactas.\n";
    mensaje += "2. Peso máximo de archivo: *300MB*.\n";
    mensaje += "3. Formato: *PDF* o *JPEG*.\n";
    mensaje += "4. Ajusta los *DPI* para obtener calidad sin superar los 300MB. Por ejemplo, con un diseño de 100cm x 100cm, si a 72DPI pesa 100MB, puedes intentar aumentar los DPI. Pero si a 150DPI ya pesa 200MB, debes ajustar cuidadosamente.\n";

    await flowDynamic(mensaje, {
        capture: true,
        buttons: [
            {body: '🔍 Más sobre DPI'},
            {body: '📧 Cotizar por correo'},
            {body: '📤 Enviar archivo'}
        ]
    });
})

.addAction({capture:true}, async (ctx, {state, flowDynamic, gotoFlow}) => {
    const decision = ctx.body;

    if(decision === '🔍 Más sobre DPI'){
        let mensajeDPI = "Dominar los *DPI* puede ser tu aliado secreto para una impresión estelar 🌟. Los DPI (puntos por pulgada) son esenciales para determinar la calidad de tu impresión. Cuanto mayor sea el número de DPI, más rica y detallada será tu impresión. Pero hay un truco: aumentar los DPI incrementa el tamaño del archivo. Imagina que tienes un diseño de 100cm x 100cm. Si a 72DPI pesa 100MB, puedes sentirte tentado a aumentar los DPI. Pero si al alcanzar 150DPI ya pesa 200MB, tendrás que hacer ajustes para no exceder los 300MB. En resumen, ¡es un equilibrio entre la perfección visual y el tamaño del archivo!";
        await flowDynamic(mensajeDPI);
        await gotoFlow(flujoFinalizar);
        
    } else if(decision === '📧 Cotizar por correo'){
        // Lógica para cotizar por correo.
        await gotoFlow(flujoFinalizar);
        
    } else if(decision === '📤 Enviar archivo'){
        // Lógica para enviar archivo.
        await gotoFlow(flujoFinalizar);
        
    }
})



