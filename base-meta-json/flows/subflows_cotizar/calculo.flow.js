const GoogleSheetService = require( "../../services/GoogleSheetService");
const chatgpt = require('../../services/chatgpt.js');

const {addKeyword, EVENTS} = require('@bot-whatsapp/bot')

const googelSheet = new GoogleSheetService(
    "1zFKxknp8KJq5UgSDnNG9awr-HLEwZIdbb6jZlQkuwtk"
  );

const flujoUnidad = require('./calculoUnidad.flow')
const flujoCalculoRollo = require('./calculoRollo.flow');



module.exports = addKeyword(EVENTS.ACTION)
.addAction(async (ctx, {state, provider, flowDynamic, fallBack, gotoFlow}) => {
    const servicio_seleccionado = state.get('servicio_seleccionado');
    

    const tipo_producto = await googelSheet.obtenerTipoPorNombre(servicio_seleccionado);
    console.log(`Tipo de producto: ${tipo_producto}`)
    if(tipo_producto === 'Unidad'){
        return await gotoFlow(flujoUnidad);
    }
    else{
        
        return await gotoFlow(flujoCalculoRollo);
    }

})