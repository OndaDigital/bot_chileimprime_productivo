const {addKeyword, EVENTS} = require('@bot-whatsapp/bot')
const {sendMessageChatWood, createContact, searchContact, listAgents, listTeams, createConversation, sendMessage} = require('../services/chatwood')
const INBOX_ID = process.env.INBOX_ID;
const ACCOUNT_ID = process.env.ACCOUNT_ID;

const flujoFinalizar = addKeyword(EVENTS.ACTION).addAnswer("El chat ha finalizado por inactividad, si deseas volver a iniciar el chat, escribe *hola*");
let timeout;

module.exports = addKeyword(EVENTS.ACTION).addAnswer("Perfecto, para continuar *escribe tu nombre:*"
,{capture:true}, async (ctx, {state, provider, flowDynamic, fallBack, gotoFlow}) => {

    const nombre = ctx.body;
    
    
    if(!validarNombre(nombre)){
        await fallBack("Nombre inválido, por favor intentelo de nuevo");
    }

    await state.update({
        nombre: nombre
    });

})
.addAnswer("Ahora escribe *tu correo:*"
,{capture:true}, async (ctx, {state, provider, flowDynamic, fallBack, gotoFlow}) => {

    const email = ctx.body;
    
    
    if(!validarCorreo(email)){
        await fallBack("Correo inválido, por favor intentelo de nuevo");
    }

    await state.update({
        email: email
    });

})
.addAnswer("Perfecto, en breve un ejecutivo te atendera. *Mientras, escribe el motivo* por el que nos escribes: ",null, async (ctx, { state, provider, flowDynamic, fallBack,gotoFlow}) => {
    
    //Datos del cliente
    const email = await state.get('email');
    const nombre = await state.get('nombre');

    const numeroConSigno = `+${ctx.from}`; //Es lo que usaremos como source_id	
    const id_agente = 84679;
    const id_team = 4044;
    //Creamos un nuevo contacto, si existe, devuelve 0, sino devuelve el ID > 0
    let id_contacto = await createContact(numeroConSigno, nombre, email);
    
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

    //Enviamos un mensaje a chatwoot para que la conversacion tenga contenido
    mensaje = `Hola, me llame ${nombre} y necesito ayuda`;
    await sendMessage(ACCOUNT_ID, id_conversacion, mensaje, 'incoming', true,"text" )

    
}).addAction( {capture:true, idle: 10000}, async (ctx, { inRef, state, provider, flowDynamic, fallBack,gotoFlow}) => {

   
   
    clearTimeout(timeout);
  // Reinicia el timeout cada vez que haya actividad
  timeout = setTimeout(() => {
    console.log("Entramos en el idle.");
    gotoFlow(flujoFinalizar);
  }, 300000);  // 5 minutos de inactividad
    
  

    const mensaje = ctx.body; 
    const id_conversacion = await state.get('id_conversacion');
    await sendMessage(ACCOUNT_ID, id_conversacion, mensaje, 'incoming', true,"text" )

    if(mensaje != "salir"){
        
        await fallBack();
    }

    

});

// Función para validar el nombre 
function validarNombre(nombre) {
    const regex = /^[a-zA-Z\s]*$/;
    return regex.test(nombre) && nombre.trim().length > 0;
  }

// Función para validar el correo electrónico
function validarCorreo(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  }