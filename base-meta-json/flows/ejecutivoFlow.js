const {addKeyword, EVENTS} = require('@bot-whatsapp/bot')
const {sendMessageChatWood} = require('../services/chatwood')


module.exports = addKeyword(EVENTS.ACTION).addAnswer("Un ejecutivo se contactara contigo a la brevedad")
.addAction( {capture:true}, async (ctx, { provider, flowDynamic, fallBack,gotoFlow}) => {
   const mensaje = ctx.body;
    
    await sendMessageChatWood(mensaje, 'incoming');
    

    if(mensaje != "salir"){
        await fallBack();
    }
   

    
    
});