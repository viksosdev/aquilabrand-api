const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const fetch = require("node-fetch");

const app = express();
const port = 3000;

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

app.use(cors());

const requestOptions = {
  http_version: "HTTP/2.0",
  maxredirects: 10,
  redirect: "follow",
};

//#region final-checkout (obtener token)
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
//#endregion

//#region payment-result (obtener datos de la transaccion)
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
//#endregion

//#region bd-productos (obtener y subir datos de productos de la bd)

app.get("/products", (req, res) => {
    let categoria = " ";
    let seccion = " ";
  //obtener productos y carritos de compra de la bd, LOS VALORES EN EL header DEBEN VENIR CON LOS NOMBRES, NO LOS ID'S.
  if (req.headers.category != undefined && req.headers.category != null && req.headers.category != "all") {
    categoria = " AND CATEGORY.CATEGORY_NAME = '" + req.headers.category + "'";
  }
  if (req.headers.section != undefined && req.headers.section != null && req.headers.section != "all") {
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

app.get("/featured", (req, res) => {
  conexion.query(
    "SELECT DISTINCT PRODUCTS.PRODUCT_ID, PRODUCTS.PRODUCT_NAME, INVENTORY.PRECIO, PRODUCTS.PRODUCT_DESCRIPTION FROM PRODUCTS, INVENTORY, COLORS, SIZES, CATEGORY, SECTION WHERE INVENTORY.PRODUCT_ID = PRODUCTS.PRODUCT_ID AND INVENTORY.COLOR_ID = COLORS.COLOR_ID AND PRODUCTS.CATEGORY_ID = CATEGORY.CATEGORY_ID AND INVENTORY.SIZE_ID = SIZES.SIZE_ID AND PRODUCTS.SECTION_ID = SECTION.SECTION_ID AND PRODUCTS.FEATURED = '0' ORDER BY PRODUCTS.PRODUCT_ID DESC;",
  (error, result) => {
    if (error){
      console.error("Error al realizar la consulta: ", error);
      res.send(error);
      return;
    }
    res.send(result);
  });
});

app.post("/products", (req, res) => {
  //guardar productos en la base de datos
  //obtener valores del php y enviar a la bd, debe ser por partes para que no ocurran errores en el sql.
  //por ejemplo, crear primero el producto, despues su inventario con colores y tallas, subir su imagen (manejar con php).
});

app.post("/edit-colors", (req, res) => { //pendiente de la creacion de la pagina que permite editar informacion de productos y eventos
  //editar colores
});

app.post("/edit-sizes", (req, res) => { //pendiente de la creacion de la pagina que permite editar informacion de productos y eventos
  //editar tallas
});

//#endregion

app.get("/transactions", (req, res) => {
    //obtener transacciones realizadas.
});

app.post("/transactions", (req, res) => {
    //guardar transacciones realizadas.

    const bolsa = req.headers.bolsa;
    const token = req.headers.token;

    conexion.query("INSERT INTO `TRANSACTIONS` (`TRANSACTION_ID`, `INFO`, `TOKEN_WEBPAY`) VALUES (NULL, '"+bolsa+"' , '"+token+"';", (error, result) => {
        if (error){
            console.error("Error al guardar: ", error);
            res.send(error);
            return;
        }
        res.send(result);
    })
    //falta
});

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

app.get("/event", (req, res) => { //pendiente de la creacion de la tabla en la db y pagina que permita crear/editar eventos
  //codigo obtener evento especifico desde la bd

  let event_id = " ";
  if(req.headers.id != undefined && req.headers.id != null){
      event_id = " WHERE EVENTS.EVENT_ID = '" + req.headers.id + "';";
  }

  conexion.query("SELECT EVENTS.EVENT_ID, EVENTS.EVENT_NAME, EVENTS.EVENT_DESCRIPTION, EVENTS.EVENT_ADDRESS, EVENT_DATE, EVENT_TIME FROM EVENTS "+event_id+" ORDER BY EVENTS.EVENT_ID DESC;", (error, result) => {
    if(error){
      console.error("Error al realizar la consulta: ", error);
      res.send(error);
      return;
    }
    res.send(result);
  
  });

});

app.post("/events", (req, res) => { //pendiente de la creacion de la tabla en la db y pagina que permita crear/editar eventos
  //codigo guardar eventos en la bd
});

//app.post("/get-product", (req, res) => {}); por el momento no encuentro que sea necesario.

//#endregion

/*app.on("error", (err) => { //reiniciar el servidor en caso de error, para evitar problemas en caso de un "fatal error" (aun en desarrollo)
  console.error("Server error:", err);
  app.restart();
});*/

app.listen(port, () => {
  console.log("AquilaBrand API server is currently running on port: " + port);
});
