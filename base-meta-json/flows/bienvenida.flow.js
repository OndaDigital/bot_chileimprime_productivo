const flujoCotizar = require('./cotizar.flow');
const flujoEjecutivo = require('./ejecutivoFlow');
const {addKeyword, EVENTS} = require('@bot-whatsapp/bot')

const tiendaInfo = {
    direccion: "Av. El Parrón 579, La Cisterna",
    telefono: "+569 7108 9933",
    correo: "chileimprime13@gmail.com",
    horario: {
        diasLaborables: "Lunes a Viernes 09:30hrs - 18:30hrs",
        sabados: "09:30 - 16:00hrs"
    }
};

const finalizarBienvenida = addKeyword(EVENTS.ACTION).addAnswer("Gracias por escribirnos, si deseas volver a iniciar el chat, escribe *hola*");

module.exports = addKeyword(EVENTS.ACTION)
    .addAnswer(
        [
            '*Por favor, selecciona una opción del menú* \n',
            '👉 *1.* Iniciar una cotización ( *La forma más rapida* )',
            '👉 *2.* Horarios y dirección del local',
            '👉 *3.* Consultar el estado de mis últimos pedidos',
            '👉 *4.* Necesito ayuda, tengo dudas con el archivo o formato',
            '👉 *5.* Hablar con un *ejecutivo* (tiempo de respuesta de 1 a 2 horas)',
            '👉 *6.* Cambiar correo y otros datos',
            '📌 Escribe *menu* en cualquier momento para volver a ver este menú ',
        ], 
    {delay:800, capture:true},async (ctx, { provider, flowDynamic, fallBack,gotoFlow}) => {
        const respuesta = ctx.body;
        console.log(ctx);
        const opciones = ['1', '2', '3', '4', '5', 'menu'];
        if(!opciones.includes(respuesta)){
            await fallBack(`La opcion: "${respuesta}" no es válida, por favor elige una opción del menú *[1, 2, 3, 4, menu]*`);
        }
        else{
            if(respuesta === '1'){
                //console.log(ctx);
                

                return await gotoFlow(flujoCotizar);
                
            }
            else if(respuesta === '2'){
                
const mensaje = `*Hola, a continuación te dejo los datos de la tienda* \n
📍 *Dirección*: ${tiendaInfo.direccion}
📞 *Whatsapp*: ${tiendaInfo.telefono}
✉️ *Correo*: ${tiendaInfo.correo}
⏰ *Horario Laboral*: ${tiendaInfo.horario.diasLaborables}
📅 *Sábados*: ${tiendaInfo.horario.sabados}
`;

                await flowDynamic(mensaje);

                setTimeout(() => {
                    return gotoFlow(finalizarBienvenida);
                }, 5000);
                

                

            }
            else if(respuesta === '3'){
                await fallBack('Esta opción no está disponible aún');
            }
            else if(respuesta === '4'){
                await fallBack('Esta opción no está disponible aún');
            }
            else if(respuesta === '5'){
                //await gotoFlow(flujoEjecutivo);
                await flowDynamic('Para contactar con un ejecutivo, por favor, clic en el siguiente numero y mandanos un mensaje: \n https://wa.me/56971089933');
            }
            else if(respuesta === 'menu'){
                await flowDynamic('bienvenida');
            }
        }
        
        
        
        
    }
    )