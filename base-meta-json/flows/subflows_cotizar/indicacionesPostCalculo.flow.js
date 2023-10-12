const { addKeyword, EVENTS } = require('@bot-whatsapp/bot');
const flujoFinalizar = require('../finalizar.flow');

module.exports = addKeyword(EVENTS.ACTION)
.addAction(async (ctx, { state, provider, flowDynamic, fallBack, gotoFlow }) => {
    console.log("Desde indicaciones");
    await flowDynamic("En espera...");
});