const {addKeyword, EVENTS} = require('@bot-whatsapp/bot')

const flujoCalculo = require('./calculo.flow');
const flujoFinalizar = require('../finalizar.flow');


module.exports = addKeyword(EVENTS.ACTION).addAnswer('🔔 *Atención:* Esta *promoción es solo válida para el local* 🏢\nubicado en *Av. El Parro 579*, La Cisterna a pasos del metro El PArron. 🚇\n🕐 *Horarios de atención:*\nLunes a sábados de 10am hasta las 18:00hrs.\n\n*¿Deseas continuar? (Si/No)* 🤔'
, {capture:true}, async (ctx, {state, flowDynamic, fallBack, gotoFlow}) => {
    const decision = ctx.body.toUpperCase();
    console.log("Desde promocion Local!!! *****");
    if(decision === 'SI'){
        await gotoFlow(flujoCalculo);
        
    } else if(decision === 'NO'){
        await gotoFlow(flujoFinalizar);
        
    } else {
        await fallBack("Opción no válida. Por favor, selecciona una letra de la lista.");
        return;
    }
});