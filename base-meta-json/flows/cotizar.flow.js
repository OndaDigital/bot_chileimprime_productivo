const GoogleSheetService = require( "../services/GoogleSheetService");
const chatgpt = require('../services/chatgpt.js');

const {addKeyword, EVENTS} = require('@bot-whatsapp/bot')

const googelSheet = new GoogleSheetService(
    "1zFKxknp8KJq5UgSDnNG9awr-HLEwZIdbb6jZlQkuwtk"
  );


const flujoCalculo = require('./subflows_cotizar/calculo.flow');
const flujoPromocionLocal = require('./subflows_cotizar/promocionLocal.flow.js');
const flujoUnidad = require('./subflows_cotizar/calculoUnidad.flow');

module.exports = addKeyword(EVENTS.ACTION)
    .addAnswer('🔍 Cargando catálogo... 📔 Por favor, espera 🙏 ¡No escribas todavía!! ⏳ Esto puede tardar unos segundos... ⏱️',
    {delay:100},
    async (ctx, { state, provider, flowDynamic, fallBack, gotoFlow}) => {
       
        await provider.sendMedia(`${ctx.from}`, 'mensaje', 'https://chileimprime.cl/wp-content/uploads/2023/10/WhatsApp-Image-2023-09-13-at-3.35.35-PM-1.jpeg');
       

    })
    .addAnswer('En base al catalogo, escribe en el chat el nombre del servicio para continuar (Solo puede ser 1)', 
    {delay:12000, capture:true},
    async (ctx, { state, flowDynamic, fallBack, gotoFlow, endFlow}) => {
        await state.update({servicios_cliente : ctx.body})
    
        try {
            // Obtiene solo los productos con stock
            const productNames = await googelSheet.obtenerNombreProductosConStock();
            const rawRespuestaCliente = state.get('servicios_cliente');            
            const matchedProducts = findBestMatches(rawRespuestaCliente, productNames);
            
        
            if (matchedProducts.length === 1) {
                flowDynamic(`Tu seleccionaste: ${matchedProducts[0]}`);
                await state.update({servicio_seleccionado : matchedProducts[0]});

                
                
            
                // Muestra el mensaje informativo de la promoción local
                if (matchedProducts[0].includes('Promoción solo Local')) {                    
                    // Muestra el mensaje informativo de la promoción local
                    await gotoFlow(flujoPromocionLocal);
                    
                }
    
                await gotoFlow(flujoCalculo);
                
                

            } else if (matchedProducts.length > 1) {                
                let message = 'Tienes varias opciones, por favor selecciona *una especificando el número*:\n\n';
                matchedProducts.forEach((product, index) => {
                    message += `*${index + 1}*. ${product}\n`;
                });
                flowDynamic(message);
                await state.update({ presented_options: matchedProducts });  // Guarda las opciones presentadas en el estado
    
                // Aquí, necesitarías otra acción para manejar la respuesta numerada del cliente
            } else {
                return fallBack(`No encontramos un producto que coincida con: ${rawRespuestaCliente}. Por favor, intenta nuevamente.`);
            }
        } catch (error) {
            console.error("Hubo un error:", error);
        }

    })
    .addAction({ capture: true }, async (ctx, { state, flowDynamic, fallBack,gotoFlow }) => {
        const respuestaCliente = ctx.body;
        const matchedProducts = state.get('presented_options');
        
        if (!isNaN(respuestaCliente) && parseInt(respuestaCliente) <= matchedProducts.length) {
            const seleccionado = matchedProducts[parseInt(respuestaCliente) - 1];
            await state.update({servicio_seleccionado : seleccionado});
            console.log("Cliente seleccionó:", seleccionado);

            // Muestra el mensaje informativo de la promoción local
            if (seleccionado.includes('Promoción solo Local')) {
                await gotoFlow(flujoPromocionLocal);
                
            }

            await gotoFlow(flujoCalculo);
        } else {
            // Esto manejaría entradas no válidas del cliente, como letras o números fuera del rango
            return fallBack("Por favor, selecciona un número válido de la lista.");
        }
    })
    
    
    function findBestMatches(input, productNames) {
        return productNames.filter(product => product.toLowerCase().includes(input));
    }
    