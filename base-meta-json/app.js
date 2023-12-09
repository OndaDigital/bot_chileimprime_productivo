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

const {getContactInfo, searchContact, createContact} = require('./services/chatwood')
const INBOX_ID = process.env.INBOX_ID;
const ACCOUNT_ID = process.env.ACCOUNT_ID;

const verificarUsuario = addKeyword(EVENTS.WELCOME).addAction(
    async (ctx, {state, provider, flowDynamic, fallBack, gotoFlow}) => {

        await gotoFlow(flujoPrincipal);
    
    });

const main = async () => {    

    const adapterDB = new JsonFileAdapter()
    const adapterFlow = createFlow([flujoPrincipal, flujoCotizar, flujoCalculo, flujoIndicaciones, flujoPromocionLocal, flujoFinalizar,
        flujoUnidad, flujoCalculoRollo, flujoSubirPedido, flujoEjecutivo, verificarUsuario])

    const adapterProvider = createProvider(MetaProvider, {
        jwtToken: 'EAAMYCtKMYnMBO5ugqlDmN2pKuPNVT4TNV27jWEt7l2RdGyc6ZAUu8zJZBVTuYujbkLEXQHcOr3ayUII1BUEPd893zzAaQGFL6FqETB1cote32SJBKwwuC9JZBMLyuWc8RLZCFQJ21JAZB7RSxKZA4FOWEJAjbFBJdnqjDGwLTAolFnRJaGVfB8KbLodphi2ioUaMUlEqAXv9s0lHQd7jwZD',
        numberId: '196314180224869',
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