require('dotenv').config();
const express = require('express');
const routes = require('./routes/chatwood-hook');

class ServerHttp{
    app;
    port = process.env.PORT || 3003;

    constructor(_providerWs){
        this.providerWs = _providerWs
    }
    buildApp = () => {
        return this.app = express()
        .use(express.json())
        .use((req, res, next) => {
            req.providerWs = this.providerWs
            next()
        })
        .use(routes)
        .listen(this.port, () => {
            console.log(`Listo por http://localhost:${this.port}`)
        })
    }
    start(){
        this.buildApp()
    }
}

module.exports = ServerHttp;