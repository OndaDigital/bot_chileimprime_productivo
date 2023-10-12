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



const main = async () => {
    const adapterDB = new JsonFileAdapter()
    const adapterFlow = createFlow([flujoPrincipal, flujoCotizar, flujoCalculo, flujoIndicaciones, flujoPromocionLocal, flujoFinalizar
        , flujoUnidad, flujoCalculoRollo, flujoSubirPedido])

    const adapterProvider = createProvider(MetaProvider, {
        jwtToken: 'EAAOqAf57coUBO6ca3xDX7Jd59dLNWP1nIZCXYUrhGuFRJ6E9BETKakAf0jdpZCzXljTYlKLsZAa2ZBoxThRIahimSGa3l3ErQ14NyKMYzALrBpO1ncbOrbI4YYVgIOxkngzHvAQVXq2xR3oIIVNOXBzQCCtVv2qHQAFFZCSXlAnBGcarphLGgLympg4yTVI4u',
        numberId: '145466428645032',
        verifyToken: 'agente',
        version: 'v16.0',
    })

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })
}

main()
