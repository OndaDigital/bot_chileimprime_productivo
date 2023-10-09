const flujoCotizar = require('./cotizar.flow');

const {addKeyword, EVENTS} = require('@bot-whatsapp/bot')



module.exports = addKeyword(['Hola', 'Menu',])
    .addAnswer(['🖨️ *COTIZADOR CHILEIMPRIME* 🖨️', 
    'Ahora podras subir tus archivos y cotizar en linea, de esta forma tomaremos tu pedido mucho mas rápido'], 
    {delay:200})
    .addAnswer(
        [            
            '👉 *1.* Iniciar una cotización (Te mostramos el catalogo, validaremos las medidas, el diseño y gestionamos tu pedido)',
            '👉 *2.* Horarios y dirección del local',
            '👉 *3.* Mis pedidos *(No disponible aún)*',
            '👉 *4.* Necesito orientación, tengo dudas con el archivo o formato',
            '👉 *5.* Hablar con un ejecutivo (tiempo de respuesta de 1 a 2 horas)',
            '📌 Escribe *menu* en cualquier momento para volver a ver este menú ',
        ], 
    {delay:800, capture:true},async (ctx, { provider, flowDynamic, fallBack,gotoFlow}) => {
        const respuesta = ctx.body;
        console.log(ctx);
        const opciones = ['1', '2', '3', '4', 'menu'];
        if(!opciones.includes(respuesta)){
            await fallBack(`La opcion: "${respuesta}" no es válida, por favor elige una opción del menú *[1, 2, 3, 4, menu]*`);
        }
        else{
            if(respuesta === '1'){
                //console.log(ctx);
                

                return gotoFlow(flujoCotizar);
                
            }
            else if(respuesta === '2'){
                await flowDynamic('horarios');
            }
            else if(respuesta === '3'){
                await fallBack('Esta opción no está disponible aún');
            }
            else if(respuesta === '4'){
                await fallBack('Esta opción no está disponible aún');
            }
            else if(respuesta === 'menu'){
                await flowDynamic('bienvenida');
            }
        }
        
        
        
        
    }
    )