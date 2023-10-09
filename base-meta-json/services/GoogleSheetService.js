require('dotenv').config();
const { JWT } = require("google-auth-library");
const { GoogleSpreadsheet } = require("google-spreadsheet");

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
];

class GoogleSheetService {
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

  /**
 * Obtener el precio de un producto a partir de su nombre.
 * @param {string} nombreProducto - El nombre del producto.
 * @returns {string|null} - Retorna el precio del producto o null si no se encuentra.
 */
async obtenerPrecioPorNombre(nombreProducto) {
  try {
      await this.doc.loadInfo();
      const sheet = this.doc.sheetsByIndex[0];
      await sheet.loadCells("D2:D100");  // Cargamos la columna de nombres de producto
      await sheet.loadCells("K2:K100");  // Cargamos la columna de precios

      const lastRow = Math.min(sheet.rowCount, 100);

      for (let i = 1; i < lastRow; i++) {
          const cellNombreProducto = sheet.getCell(i, 3);  // Columna D
          if (cellNombreProducto.value === nombreProducto) {
              const cellPrecio = sheet.getCell(i, 10);  // Columna K
              return cellPrecio.value;
          }
      }
      return null;  // Si el producto no se encuentra, retornamos null
  } catch (err) {
      console.log(err);
      return null;  // En caso de error, retornamos null por defecto
  }
}


  /**
 * Recuperar los nombres de los productos que tienen stock.
 * @returns {Array} - Lista de nombres de productos con stock.
 */
async obtenerNombreProductosConStock() {
  try {
      const productos = [];
      await this.doc.loadInfo();
      const sheet = this.doc.sheetsByIndex[0];
      await sheet.loadCells("D2:D100");
      await sheet.loadCells("I2:I100");

      const lastRow = Math.min(sheet.rowCount, 100);

      for (let i = 1; i < lastRow; i++) {
          const cellNombreProducto = sheet.getCell(i, 3);
          const cellStock = sheet.getCell(i, 8);
          if (cellNombreProducto.value && cellStock.value > 0) {
              productos.push(cellNombreProducto.value);
          }
      }
      return productos;
  } catch (err) {
      console.log(err);
      return [];
  }
}


/**
 * Verificar si un producto tiene stock disponible
 * @param {string} nombreProducto - El nombre del producto a verificar
 * @returns {boolean} - Retorna true si hay stock disponible, false en caso contrario
 */
async hasStock(nombreProducto) {
  try {
      await this.doc.loadInfo();
      const sheet = this.doc.sheetsByIndex[0]; 
      await sheet.loadCells("D2:D100"); // Cargamos la columna de nombres de producto
      await sheet.loadCells("I2:I100"); // Cargamos la columna de stock

      const lastRow = Math.min(sheet.rowCount, 100); // Como mencionaste que podría haber hasta 100 filas

      for (let i = 1; i < lastRow; i++) {
          const cellNombreProducto = sheet.getCell(i, 3); // Columna D
          if (cellNombreProducto.value === nombreProducto) {
              const cellStock = sheet.getCell(i, 8); // Columna I
              return cellStock.value > 0; // Si es mayor que 0, retornará true, sino false
          }
      }
      return false; // Si el producto no se encuentra, retornamos false por defecto
  } catch (err) {
      console.log(err);
      return false; // En caso de error, retornamos false por defecto
  }
};


consultarMedidasDisponibles = async (nombreProducto) => {

  await this.doc.loadInfo();

  const sheet = this.doc.sheetsByIndex[0];
  await sheet.loadCells('A1:AO60');

  let categoriasEspeciales = ['Banderas', 'Back Light', 'Adhesivos'];
  let buscarPor = nombreProducto;

  // Identificar la categoría del producto seleccionado
  let categoriaProducto = "";
  for (let i = 1; i < sheet.rowCount && i < 60; i++) {
      const cellNombreProducto = sheet.getCell(i, 3);
      if (cellNombreProducto.value === nombreProducto) {
          categoriaProducto = sheet.getCell(i, 1).value;
          break;
      }
  }

  // Si el producto pertenece a una de las categorías especiales, 
  // ajustar el valor `buscarPor`
  if (categoriasEspeciales.includes(categoriaProducto)) {
      buscarPor = categoriaProducto;
  }

  console.log('Buscar por:', buscarPor);
  console.log('Categoria :', categoriaProducto);
  // Buscar la tabla a partir de la columna M que tenga el nombre `buscarPor`.
  for (let j = 12; j < sheet.columnCount && j <= 40; j++) {
      const cell = sheet.getCell(0, j);
      if (cell.value === buscarPor) {
          let medidas = [];
          let rowIndex = 1;
          while (sheet.getCell(rowIndex, j).value !== null && rowIndex < 60) {
              let material = sheet.getCell(rowIndex, j).value;
              let imprimible = sheet.getCell(rowIndex, j + 1).value;
              if (material && imprimible) medidas.push({ material, imprimible });
              rowIndex++;
          }
          //console.log('Medidas encontradas:', medidas);
          return medidas;
      }
  }
  return [];
}



 
}

module.exports = GoogleSheetService;