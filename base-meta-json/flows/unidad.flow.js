const {addKeyword, EVENTS} = require('@bot-whatsapp/bot')

module.exports = addKeyword(EVENTS.ACTION).addAction(async (ctx, {state, provider, flowDynamic, fallBack, gotoFlow}) => {
    await flowDynamic("Esperando instrucciones...");
});