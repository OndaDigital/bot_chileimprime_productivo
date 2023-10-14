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
    const telefono = body?.conversation?.meta?.sender?.phone_number

    if(body?.private){
       res.send(null); 
       return;
    }


    console.log(JSON.stringify(body?.conversation?.meta?.sender?.phone_number));
    console.log(JSON.stringify(body?.content));
    res.send(body);
    console.log(`\n *********** \n`);

    await providerWs.sendtext(`${telefono}`,body?.content);
};

/**
 * Controller
 */
router.post('/chatwood-hook', chatWoodHook);

module.exports = router;
