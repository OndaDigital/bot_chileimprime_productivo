const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')

const MetaProvider = require('@bot-whatsapp/provider/meta')
const JsonFileAdapter = require('@bot-whatsapp/database/json')

const flujoCalculoRollo = require('./flows/subflows_cotizar/calculoRollo.flow.js');
const flujoUnidad = require('./flows/subflows_cotizar/calculoUnidad.flow');
const flujoCotizar = require('./flows/cotizar.flow');
const flujoPrincipal = require('./flows/bienvenida.flow')
const flujoCalculo = require('./flows/subflows_cotizar/calculo.flow.js');
const flujoFinalizar = require('./flows/finalizar.flow');
const flujoIndicaciones = require('./flows/subflows_cotizar/indicacionesPostCalculo.flow.js');
const flujoPromocionLocal = require('./flows/subflows_cotizar/promocionLocal.flow.js');
const flujoSubirPedido = require('./flows/subflows_cotizar/subirPedido.flow');
const flujoEjecutivo = require('./flows/ejecutivoFlow');
const ServerHttp = require('./http/index.js');

const {getContactInfo, searchContact} = require('./services/chatwood')
const INBOX_ID = process.env.INBOX_ID;
const ACCOUNT_ID = process.env.ACCOUNT_ID;

//Se inicia la conversacion con el correo
const pedirCorreo = addKeyword(EVENTS.WELCOME).addAnswer("Hola, soy el asistente virtual de Chileimprime, para comenzar, *por favor ingresa tu correo electrónico*"
,{capture:true}, async (ctx, {state, provider, flowDynamic, fallBack, gotoFlow}) => {
    
    const email = ctx.body;
    const nombre = ctx.pushName;
    const numero = ctx.from;
    
    //Time out necesario para que el bot no se quede esperando una respuesta
    let timeout = null;
    await state.update({timeout: timeout});
    
    if(!validarCorreo(email)){
        await fallBack("Correo inválido, por favor inténtelo de nuevo");
    }
    else{
        await state.update({
            email: email,
            nombre: nombre,
            numero_cliente: numero
        });
        console.log(`Email: ${email} - Nombre: ${nombre}`);

        //Obtener informacion del contacto
        const contactId = await searchContact(`+${numero}`);
        const contactInfo = await getContactInfo(contactId);
        if (contactInfo) {
            console.log('Información del contacto:', contactInfo);
        }
        await gotoFlow(flujoPrincipal);
    }

});

const main = async () => {    

    const adapterDB = new JsonFileAdapter()
    const adapterFlow = createFlow([flujoPrincipal, flujoCotizar, flujoCalculo, flujoIndicaciones, flujoPromocionLocal, flujoFinalizar,
        flujoUnidad, flujoCalculoRollo, flujoSubirPedido, flujoEjecutivo, pedirCorreo])

    const adapterProvider = createProvider(MetaProvider, {
        jwtToken: 'EAAOqAf57coUBO6ca3xDX7Jd59dLNWP1nIZCXYUrhGuFRJ6E9BETKakAf0jdpZCzXljTYlKLsZAa2ZBoxThRIahimSGa3l3ErQ14NyKMYzALrBpO1ncbOrbI4YYVgIOxkngzHvAQVXq2xR3oIIVNOXBzQCCtVv2qHQAFFZCSXlAnBGcarphLGgLympg4yTVI4u',
        numberId: '145466428645032',
        verifyToken: 'agente',
        version: 'v16.0',
    })
    const server = new ServerHttp(adapterProvider);

    await createBot({ // ** NUEVO: Se agrego await para esperar a que se cree el bot
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    server.start();
}

main()


// Función para validar el correo electrónico
function validarCorreo(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  }