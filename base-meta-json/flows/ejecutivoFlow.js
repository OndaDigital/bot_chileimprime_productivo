const {addKeyword, EVENTS} = require('@bot-whatsapp/bot')
const {sendMessageChatWood, createContact, searchContact, listAgents, listTeams, createConversation, sendMessage} = require('../services/chatwood')
const INBOX_ID = process.env.INBOX_ID;
const ACCOUNT_ID = process.env.ACCOUNT_ID;

module.exports = addKeyword(EVENTS.ACTION).addAnswer("Un ejecutivo se contactara contigo a la brevedad")
.addAction( async (ctx, { state, provider, flowDynamic, fallBack,gotoFlow}) => {
           
    const numeroConSigno = `+${ctx.from}`; //Es lo que usaremos como source_id	
    const id_agente = 84679;
    const id_team = 4044;
    //Creamos un nuevo contacto, si existe, devuelve 0, sino devuelve el ID > 0
    let id_contacto = await createContact(numeroConSigno);
    
    //Si el contacto existe, entonces lo buscamos y obtenemos su ID
    if(id_contacto == 0){
        id_contacto = await searchContact(numeroConSigno);
    }

    //Creamoos la nueva conversacion
    const id_conversacion = await createConversation(numeroConSigno, INBOX_ID, id_contacto, 'open', id_agente, id_team );
    console.log(`ID de conversacion: ${id_conversacion}`);
    
    state.update({        
        id_conversacion: id_conversacion
        });


    
}).addAction( {capture:true}, async (ctx, { state, provider, flowDynamic, fallBack,gotoFlow}) => {

    const mensaje = ctx.body; 
    const id_conversacion = state.get('id_conversacion');
    await sendMessage(ACCOUNT_ID, id_conversacion, mensaje, 'incoming', true,"text" )

    if(mensaje != "salir"){
        await fallBack();
    }

});