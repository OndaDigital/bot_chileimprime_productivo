require('dotenv').config();
const { JWT } = require("google-auth-library");
const { GoogleSpreadsheet } = require("google-spreadsheet");

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
];

class GoogleSheetPedidos {
  jwtFromEnv = undefined;
  doc = undefined;

  constructor(id = undefined) {
    if (!id) {
      throw new Error("ID_UNDEFINED");
    }

    this.jwtFromEnv = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: SCOPES,
    });
    this.doc = new GoogleSpreadsheet(id, this.jwtFromEnv);
  }

    // Método para obtener el último ID
    async obtenerUltimoID() {
        await this.doc.loadInfo();
        const sheet = this.doc.sheetsByTitle["Pedidos_whatsapp"];  // Cargando la hoja "Pedidos_whatsapp"
        await sheet.loadCells('A3:A1000');  
        
        let ultimoID = "WA-00001";  // Valor por defecto
        for (let i = 2; i < 1000; i++) {  // Comienza desde la fila 3
            const cell = sheet.getCell(i, 0);  // Columna A
            if (cell.value) {
                ultimoID = cell.value;
            } else {
                break;
            }
        }

        const numero = parseInt(ultimoID.split("-")[1]) + 1;
        return `WA-${String(numero).padStart(5, '0')}`;  // Retornar el siguiente ID
    }

    // Método para agregar un nuevo pedido
    // Método para agregar un nuevo pedido
    async agregarPedido(state) {
        console.log("Cargando información del documento...");
        await this.doc.loadInfo();
        console.log("Información cargada.");

        
        const sheet = this.doc.sheetsByTitle["Pedidos_whatsapp"];  // Cargando la hoja "Pedidos_whatsapp"
        if (!sheet) {
            console.error("No se encontró la hoja 'Pedidos_whatsapp'. Verifica que el título sea correcto.");
            return;
        } else {
            console.log("Hoja 'Pedidos_whatsapp' seleccionada.");
        }

        const nuevoID = await this.obtenerUltimoID();
        console.log("Nuevo ID generado:", nuevoID);

        console.log("Agregando nuevo pedido...");
        // Rellenando con la información proporcionada y valores por defecto
        await sheet.addRow({
            'ID': nuevoID,
            'Fecha de ingreso': new Date().toLocaleString('es-CL', { hour12: true, dateStyle: 'short', timeStyle: 'short' }),
            'Cajero': 'BOT',
            'Nombre de Servicio': state.servicio_seleccionado,
            'Ancho': state.anchoSeleccionado,
            'Altura': state.alturaSeleccionada,
            'Precio por m2': state.precioPorMetro,
            'Cantidad': `${state.anchoSeleccionado * state.alturaSeleccionada} m2`,
            'Subtotal': state.precioTotal,
            'Nombre de la Terminación': state.extra,
            'Precio de la Terminación': state.extra_precio,
            'IVA': (state.precioTotalConExtra * 0.19),  // Asumiendo IVA de 19%
            'Total': state.precioTotalConExtra,
            // Puedes agregar más campos aquí conforme los tengas
        });
        console.log("Pedido agregado con éxito.");
    }
}

module.exports = GoogleSheetPedidos;
