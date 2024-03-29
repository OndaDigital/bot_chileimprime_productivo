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
    
    let ultimoNumero = 0;  // Valor por defecto
    for (let i = 2; i < 1000; i++) {  // Comienza desde la fila 3
        const cell = sheet.getCell(i, 0);  // Columna A
        if (cell.value) {
            const partes = cell.value.split("-");
            if (partes.length === 2 && partes[0] === "WA") {
                const numeroExtraido = parseInt(partes[1]);
                if (!isNaN(numeroExtraido) && numeroExtraido > ultimoNumero) {
                    ultimoNumero = numeroExtraido;
                }
            }
        } else {
            break;
        }
    }

    return `WA-${ultimoNumero + 1}`;  // Retornar el siguiente ID
  }


    // Método para agregar un nuevo pedido
    // Método para agregar un nuevo pedido
    async agregarPedido(state) {
      try{
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
            'Número servicios' : 1,
            'Medio de pago' : '',
            'Fecha de ingreso': new Date().toLocaleString('es-CL', { hour12: true, dateStyle: 'short', timeStyle: 'short' }),
            'Fecha modificación': new Date().toLocaleString('es-CL', { hour12: true, dateStyle: 'short', timeStyle: 'short' }),
            'Cajero': 'BOT',
            'Nombre del servicio': state.servicio_seleccionado,
            'Cant.': 1,
            'Medidas' : `${state.anchoSeleccionado} x ${state.alturaSeleccionada}`,
            'Área' : state.areaTotal,
            'Precio por m2': state.precioPorMetro,
            'Precio base' : state.precioTotal,            
            'Tipo de Terminación': state.extra,
            'Precio de Terminación/m2': state.extra_precio,
            'DTE' : state.DTE,
            'NETO / Subtotal': state.precioTotalConExtra,
            'TOTAL + IVA' : state.totalConIva,
            'Nombre' : state.nombre,
            'Teléfono' : state.numero_cliente,
            'Correo' : state.email,
            'Razón social' : '',
            'Comuna facturacion' : '',
            'Giro' : '',
            'Teléfono facturación' : '',
            'ESTADEL PROYECTO' : 'Sin iniciar',
            // Se iran agregando mas campos conforme sea necesario
        });
        console.log("Pedido agregado con éxito.");
        return nuevoID;
      }
      catch (err) {        
        console.error("Error al agregar el pedido:", err);
        return "Error al agregar el pedido";
      }
    }
}

module.exports = GoogleSheetPedidos;
