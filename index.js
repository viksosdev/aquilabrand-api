const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const fetch = require("node-fetch");

const app = express();
const port = 3000;

//#region DB Connection

conexion = mysql.createConnection({
  host: "db4free.net",
  user: "coitoscrew",
  password: "coitosporsiempre2023",
  database: "aquilabrand",
  multipleStatements: true
});

conexion.connect((error) => {
  if (error) {
    console.error("Error al conectar a la base de datos: ", error);
    return;
  }
});

//#endregion DB

//#region Server

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(
  express.json({
    type: "*/*",
  })
);

app.use(cors(
  {
    origin: "http://localhost:5173"
  }
));

//#endregion Server

const requestOptions = {
  http_version: "HTTP/2.0",
  maxredirects: 10,
  redirect: "follow",
};

//#region TRANSBANK: Post para obtener token y Get para confirmar y obtener datos.
app.post("/checkout", (req, res) => {
  fetch(
    "https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions",
    {
      method: "POST",
      requestOptions,
      headers: {
        "Tbk-Api-Key-Id": "597055555532",
        "Tbk-Api-Key-Secret":
          "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    }
  )
    .then((response) => response.json())
    .then((result) => {
      res.send(result);
    })

    .catch((error) => res.send("ERROR!", error));
});

app.get("/checkout", (req, res) => {
  token = req.headers.token;
  fetch(
    "https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions/" +
      token,
    {
      method: "PUT",
      requestOptions,
      headers: {
        "Tbk-Api-Key-Id": "597055555532",
        "Tbk-Api-Key-Secret":
          "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C",
        "Content-Type": "application/json",
      },
    }
  )
    .then((response) => response.json())
    .then((result) => {
      res.send(result);
    });
});

//#endregion TRANSBANK

//#region PRODUCTS: products para obtener los productos de la bd con seccion y categoria especifica, featured para destacados.

app.get("/products", (req, res) => {
    let categoria = " ";
    let seccion = " ";
  //obtener productos y carritos de compra de la bd, LOS VALORES EN EL header DEBEN VENIR CON LOS NOMBRES, NO LOS ID'S.
  if (req.headers.category != undefined && req.headers.category != null && req.headers.category != "all" && req.headers.category != "undefined") {
    categoria = " AND CATEGORY.CATEGORY_NAME = '" + req.headers.category + "'";
  }
  if (req.headers.section != undefined && req.headers.section != null && req.headers.section != "all" && req.headers.section != "undefined") {
    seccion = " AND SECTION.SECTION_NAME = '" + req.headers.section + "'";
  }

  conexion.query(
    "SELECT DISTINCT PRODUCTS.PRODUCT_ID, PRODUCTS.PRODUCT_NAME, INVENTORY.PRECIO, PRODUCTS.PRODUCT_DESCRIPTION FROM PRODUCTS, INVENTORY, COLORS, SIZES, CATEGORY, SECTION WHERE INVENTORY.PRODUCT_ID = PRODUCTS.PRODUCT_ID AND INVENTORY.COLOR_ID = COLORS.COLOR_ID AND PRODUCTS.CATEGORY_ID = CATEGORY.CATEGORY_ID AND INVENTORY.SIZE_ID = SIZES.SIZE_ID AND PRODUCTS.SECTION_ID = SECTION.SECTION_ID" +
      categoria +
      seccion +
      " ORDER BY PRODUCTS.PRODUCT_ID DESC;",
    (error, result) => {
      if (error) {
        console.error("Error al realizar la consulta: ", error);
        res.send(error);
        return;
      }
      res.send(result);
    }
  );

});

app.get("/images", (req, res) => {
  let categoria = " ";
  let seccion = " ";
  let producto = " ";
  let featured = " ";

  if (req.headers.category != undefined && req.headers.category != null && req.headers.category != "all" && req.headers.category != "undefined") {
    categoria = " AND CATEGORY.CATEGORY_NAME = '" + req.headers.category + "'";
  }
  if (req.headers.section != undefined && req.headers.section != null && req.headers.section != "all" && req.headers.section != "undefined") {
    seccion = " AND SECTION.SECTION_NAME = '" + req.headers.section + "'";
  }
  if (req.headers.product != undefined && req.headers.product != null && req.headers.product != "all" && req.headers.product != "undefined") {
    producto = " AND IMAGES.PRODUCT_ID = '" + req.headers.product + "'";
  }
  if (req.headers.featured != undefined && req.headers.featured != null && req.headers.featured != "all" && req.headers.featured != "undefined") {
    featured = " AND PRODUCTS.FEATURED = '1'";
  }
  const query = "SELECT DISTINCT IMAGES.IMAGE_ID, IMAGES.PRODUCT_ID, IMAGES.COLOR_ID, COLORS.COLOR_NAME, IMAGES.IMAGE, IMAGES.IMAGE_2, IMAGES.IMAGE_3 FROM IMAGES, PRODUCTS, INVENTORY, COLORS,CATEGORY, SECTION WHERE INVENTORY.PRODUCT_ID = PRODUCTS.PRODUCT_ID AND INVENTORY.COLOR_ID = COLORS.COLOR_ID AND COLORS.COLOR_ID = IMAGES.COLOR_ID AND PRODUCTS.CATEGORY_ID = CATEGORY.CATEGORY_ID AND PRODUCTS.SECTION_ID = SECTION.SECTION_ID"+
  categoria +
  seccion +
  producto +
  featured +
  "ORDER BY IMAGES.PRODUCT_ID ASC;"

  conexion.query(query, (error, result) => {
    if(error){
      console.error("Error al realizar la consulta: ", error);
      res.send(error);
      return;
    }
    res.send(result);
  });
});

app.get("/featured", (req, res) => {
  conexion.query(
    "SELECT DISTINCT PRODUCTS.PRODUCT_ID, PRODUCTS.PRODUCT_NAME, INVENTORY.PRECIO, PRODUCTS.PRODUCT_DESCRIPTION FROM PRODUCTS, INVENTORY, COLORS, SIZES, CATEGORY, SECTION WHERE INVENTORY.PRODUCT_ID = PRODUCTS.PRODUCT_ID AND INVENTORY.COLOR_ID = COLORS.COLOR_ID AND PRODUCTS.CATEGORY_ID = CATEGORY.CATEGORY_ID AND INVENTORY.SIZE_ID = SIZES.SIZE_ID AND PRODUCTS.SECTION_ID = SECTION.SECTION_ID AND PRODUCTS.FEATURED = '1' ORDER BY PRODUCTS.PRODUCT_ID DESC;",
  (error, result) => {
    if (error){
      console.error("Error al realizar la consulta: ", error);
      res.send(error);
      return;
    }
    res.send(result);
  });
});

//#endregion PRODUCTS

//#region PRODUCT: Get para obtener producto especifico, post para agregar producto a carrito de compra, Put para actualizar carrito de compra y delete para eliminar producto de carrito de compra.

app.get("/product", (req, res) => {
  //obtener producto especifico.
  let idProduct = " ";
  let idProductINV = " ";
  if(req.headers.id != undefined && req.headers.id != null){
      idProduct = " AND PRODUCTS.PRODUCT_ID = '" + req.headers.id + "'";
      idProductINV = " AND INVENTORY.PRODUCT_ID = '" + req.headers.id + "'";
  }
  else{
      res.send("No se ha especificado un id de producto.");
      return;
  }
  conexion.query("SELECT INVENTORY.INVENTORY_ID, PRODUCTS.PRODUCT_ID, PRODUCTS.PRODUCT_NAME, INVENTORY.PRECIO, PRODUCTS.PRODUCT_DESCRIPTION, INVENTORY.SIZE_ID, INVENTORY.COLOR_ID, SIZES.SIZE_NAME, COLORS.COLOR_NAME FROM PRODUCTS, INVENTORY, COLORS, SIZES, CATEGORY, SECTION WHERE INVENTORY.PRODUCT_ID = PRODUCTS.PRODUCT_ID AND INVENTORY.COLOR_ID = COLORS.COLOR_ID AND PRODUCTS.CATEGORY_ID = CATEGORY.CATEGORY_ID AND INVENTORY.SIZE_ID = SIZES.SIZE_ID AND PRODUCTS.SECTION_ID = SECTION.SECTION_ID"+idProduct+"; SELECT DISTINCT COLORS.COLOR_NAME, COLORS.COLOR_ID FROM COLORS, INVENTORY, PRODUCTS WHERE INVENTORY.COLOR_ID = COLORS.COLOR_ID"+idProductINV+"; SELECT DISTINCT SIZES.SIZE_NAME, SIZES.SIZE_ID FROM SIZES, INVENTORY, PRODUCTS WHERE INVENTORY.SIZE_ID = SIZES.SIZE_ID"+idProductINV+"; ", (error, result) => {
      if (error) {
        console.error("Error al realizar la consulta: ", error);
        res.send(error);
        return;
      }
      res.send(result);
      
  });

});

app.post("/product", (req, res) => {

  const query = "INSERT INTO PRODUCTS VALUES ( NULL , '"+req.headers.category+"', '"+req.headers.section+"', '"+req.headers.name+"', '"+req.headers.description+"', '"+req.headers.featured+"');"
  
  conexion.query(query, (error, result) => {
    if(error){
      console.error("Error al realizar la consulta: ", error);
      res.send(error);
      return;
    }
    res.send(result);
  });
});

app.put("/product", (req, res) => {

  let category = " ";
  let section = " ";
  let name = " ";
  let description = " ";
  let featured = " ";

  if(req.headers.category != undefined && req.headers.category != null && req.headers.category != ""){
    category = "UPDATE PRODUCTS SET CATEGORY_ID = '"+req.headers.category+"' WHERE PRODUCT_ID = '"+req.headers.product_id+"';"
  }
  if(req.headers.section != undefined && req.headers.section != null && req.headers.section != ""){
    section = "UPDATE PRODUCTS SET SECTION_ID = '"+req.headers.section+"' WHERE PRODUCT_ID = '"+req.headers.product_id+"';"
  }
  if(req.headers.name != undefined && req.headers.name != null && req.headers.name != ""){
    name = "UPDATE PRODUCTS SET PRODUCT_NAME = '"+req.headers.name+"' WHERE PRODUCT_ID = '"+req.headers.product_id+"';"
  }
  if(req.headers.description != undefined && req.headers.description != null && req.headers.description != ""){
    description = "UPDATE PRODUCTS SET PRODUCT_DESCRIPTION = '"+req.headers.description+"' WHERE PRODUCT_ID = '"+req.headers.product_id+"';"
  }
  if(req.headers.featured != undefined && req.headers.featured != null && req.headers.featured != ""){
    featured = "UPDATE PRODUCTS SET PRODUCT_FEATURED = '"+req.headers.featured+"' WHERE PRODUCT_ID = '"+req.headers.product_id+"';"
  }

  const query = category+section+name+description+featured;

  conexion.query(query, (error, result) => {
    if(error){
      console.error("Error al realizar la consulta: ", error);
      res.send(error);
      return;
    }
    res.send(result);
  });
});

app.delete("/product", (req, res) => {

  const query = "DELETE FROM PRODUCTS WHERE PRODUCT_ID = '"+req.headers.product_id+"';"

  conexion.query(query, (error, result) => {
    if(error){
      console.error("Error al realizar la consulta: ", error);
      res.send(error);
      return;
    }
    res.send(result);
  });
});

//#endregion PRODUCT

//#region TRANSACTIONS: GET para obtener transacciones y POST para guardar transacciones.

app.get("/transactions", (req, res) => {
    //obtener transacciones realizadas.
  let token = " ";

  if (req.headers.token != undefined && req.headers.token != null && req.headers.token != "all") {
    token = " WHERE TRANSACTIONS.TOKEN_WEBPAY = '" + req.headers.token+"'"
  }

  const query = "SELECT * FROM TRANSACTIONS "+token;
  conexion.query(query, (error, result) => {
    if(error){
      console.error("Error al realizar la consulta: ", error);
      res.send(error);
      return;
    }
    res.send(result);
  });
});

app.post("/transactions", (req, res) => {
    //guardar transacciones realizadas.

    const bolsa = req.body.bolsa;
    const token = req.headers.token;

    const cliente = req.body.cliente;
    const info_cliente = JSON.stringify(cliente);

    const carro = JSON.stringify(bolsa);
    const webpay = "'"+token+"'";

    const query = "INSERT INTO TRANSACTIONS VALUES ( NULL, '"+info_cliente+"' , '"+carro+"' , "+webpay+", '"+req.headers.estado+"');"

    const queryDup = "SELECT * FROM TRANSACTIONS WHERE TOKEN_WEBPAY = "+webpay+";"

    conexion.query(queryDup, (error, result) => {
        if (error){
          console.error("Error al guardar: ", error);
          res.send(error);
          return;
        }
        if(result.length > 0){
          res.send("Ya existe una transaccion con este token.");
          return;
        }
        else{
          conexion.query(query, (error, result) => {
            if (error){
                console.error("Error al guardar: ", error);
                res.send(error);
                return;
            }
            res.send(result);
          });
        }
        
    })
});

app.put("/transactions", (req, res) => {
    //actualizar transacciones realizadas.
    const token = req.headers.token;

    const estado = req.headers.estado;

    const query = "UPDATE TRANSACTIONS SET ESTADO = '"+estado+"' WHERE TOKEN_WEBPAY = '"+token+"';"

    if(token == undefined || token == null || token == "" || token == "undefined"){
      res.send("No se ha ingresado un token valido.");
      return;
    }

    conexion.query(query, (error, result) => {
      if (error){
        console.error("Error al guardar: ", error);
        res.send(error);
        return;
      }
      res.send(result);
    });
});

//#endregion TRANSACTIONS

//#region Eventos: GET para obtener eventos, POST para crear eventos, PUT para editar eventos.

app.get("/event", (req, res) => { //pendiente de la creacion de la tabla en la db y pagina que permita crear/editar eventos
  //codigo obtener evento especifico desde la bd

  let event_id = " ";
  if(req.headers.id != undefined && req.headers.id != null){
      event_id = " WHERE EVENTS.EVENT_ID = '" + req.headers.id + "';";
  }

  conexion.query("SELECT EVENTS.EVENT_ID, EVENTS.EVENT_NAME, EVENTS.EVENT_DESCRIPTION, EVENTS.EVENT_ADDRESS, EVENT_DATE, EVENT_TIME, EVENT_IMAGE FROM EVENTS "+event_id+" ORDER BY EVENTS.EVENT_ID DESC;", (error, result) => {
    if(error){
      console.error("Error al realizar la consulta: ", error);
      res.send(error);
      return;
    }
    res.send(result);
  
  });

});

//#endregion Eventos

//#region PUERTO

app.listen(port, () => {
  console.log("AquilaBrand API server is currently running on port: " + port);
});

//#endregion PUERTO

//#region Regiones

app.get("/region", (req, res) => {

  const query = "SELECT COMUNA.COMUNA_ID, COMUNA.REGION_ID, COMUNA.COMUNA_NOMBRE, COMUNA.COSTO_ENVIO, REGION.REGION_NOMBRE FROM COMUNA, REGION WHERE REGION.REGION_ID = COMUNA.REGION_ID ORDER BY COMUNA.COMUNA_ID ASC; SELECT * FROM REGION ORDER BY REGION.REGION_ID;"

  conexion.query(query, (error, result) => {
    if(error){
      console.log("Error al realizar la consulta: ", error);
      res.send(error);
      return;
    }
    res.send(result);
  });
});

//#endregion Regiones
