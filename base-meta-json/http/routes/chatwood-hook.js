const express = require('express');
const router = express.Router();

/**
 * Router
 * @param {*} req
 * @param {*} res
 */
const chatWoodHook = async (req, res) => {
    const providerWs = req.providerWs;
    const body = req.body;
    
    // Verificación del payload
    if (!body || !body.conversation || !body.conversation.meta || !body.conversation.meta.sender) {
      //console.log("Payload incompleto");
      res.status(400).send("Payload incompleto");
      return;
    }
  
    const telefono = body.conversation.meta.sender.phone_number;
  
    if (body.private) {
      res.send(null);
      return;
    }
  
    console.log(telefono);
    console.log(body.content);
    
    res.send(body); // o res.status(200).send("OK") si es necesario
    console.log(`\n *********** \n`);
  
    try {
      await providerWs.sendtext(telefono, body.content);
    } catch (error) {
      console.log("Error al enviar el mensaje:", error);
    }
  };
  
  router.post('/chatwood-hook', chatWoodHook);
  

module.exports = router;
