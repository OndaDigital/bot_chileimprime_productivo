const GoogleSheetPedidos = require('../../services/GoogleSheetPedidos');


const {addKeyword, EVENTS} = require("@bot-whatsapp/bot");

const googelSheet = new GoogleSheetPedidos(
    "1zFKxknp8KJq5UgSDnNG9awr-HLEwZIdbb6jZlQkuwtk"
  );


module.exports = addKeyword(EVENTS.ACTION).addAction(async (ctx, {state, provider, flowDynamic, fallBack, gotoFlow}) => {
    await flowDynamic("Desde subir pedido");
    const pedido = state.getMyState();
    // Agrega el pedido a la hoja:
    googelSheet.agregarPedido(pedido).then(() => {
        console.log("Pedido agregado con éxito");
    }).catch(err => {
        console.error("Hubo un error al agregar el pedido:", err);
    });

    console.log(pedido);
});