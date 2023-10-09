const {addKeyword, EVENTS} = require('@bot-whatsapp/bot')



module.exports = addKeyword(EVENTS.ACTION).addAnswer("FIN, vuelve a escribir *Hola o Menu*");