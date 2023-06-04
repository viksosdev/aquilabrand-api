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
app.post("/final-checkout", (req, res) => {
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
app.get("/final-checkout", (req, res) => {
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

app.get("/bd-productos", (req, res) => {
    let categoria = " ";
    let seccion = " ";
    let color = " ";
    let talla = " ";
  //obtener productos y carritos de compra de la bd, LOS VALORES EN EL header DEBEN VENIR CON LOS NOMBRES, NO LOS ID'S.
  if (req.headers.color != undefined && req.headers.color != null && req.headers.color != "0") {
    color = " AND COLORS.COLOR_NAME = '" + req.headers.color + "'";
  }
  if (req.headers.size != undefined && req.headers.size != null && req.headers.size != "0") {
    talla = " AND SIZES.SIZE_NAME = '" + req.headers.size + "'";
  }
  if (req.headers.category != undefined && req.headers.category != null && req.headers.category != "0") {
    categoria = " AND CATEGORY.CATEGORY_NAME = '" + req.headers.category + "'";
  }
  if (req.headers.section != undefined && req.headers.section != null && req.headers.section != "0") {
    seccion = " AND SECTION.SECTION_NAME = '" + req.headers.section + "'";
  }

  conexion.query(
    "SELECT DISTINCT PRODUCTS.PRODUCT_ID, PRODUCTS.PRODUCT_NAME, INVENTORY.PRECIO, PRODUCTS.PRODUCT_DESCRIPTION FROM PRODUCTS, INVENTORY, COLORS, SIZES, CATEGORY, SECTION WHERE INVENTORY.PRODUCT_ID = PRODUCTS.PRODUCT_ID AND INVENTORY.COLOR_ID = COLORS.COLOR_ID AND PRODUCTS.CATEGORY_ID = CATEGORY.CATEGORY_ID AND INVENTORY.SIZE_ID = SIZES.SIZE_ID AND PRODUCTS.SECTION_ID = SECTION.SECTION_ID" +
      categoria +
      seccion +
      color +
      talla +
      ";",
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

app.post("/bd-productos", (req, res) => {
  //guardar productos en la base de datos

});

//#endregion

app.get("/transactions", (req, res) => {
    //obtener transacciones realizadas.
});

app.post("/transactions", (req, res) => {
    //guardar transacciones realizadas.
});

app.get("/get-product", (req, res) => {
    //obtener producto especifico.
    let idProduct = " ";
    if(req.headers.id != undefined && req.headers.id != null){
        idProduct = " AND PRODUCTS.PRODUCT_ID = '" + req.headers.id + "'";
        idProductINV = " AND INVENTORY.PRODUCT_ID = '" + req.headers.id + "'";
    }
    else{
        res.send("No se ha especificado un id de producto.");
        return;
    }
    /*conexion.query("SELECT PRODUCTS.PRODUCT_ID, PRODUCTS.PRODUCT_NAME, INVENTORY.PRECIO, PRODUCTS.PRODUCT_DESCRIPTION FROM PRODUCTS, INVENTORY, COLORS, SIZES, CATEGORY, SECTION WHERE INVENTORY.PRODUCT_ID = PRODUCTS.PRODUCT_ID AND INVENTORY.COLOR_ID = COLORS.COLOR_ID AND PRODUCTS.CATEGORY_ID = CATEGORY.CATEGORY_ID AND INVENTORY.SIZE_ID = SIZES.SIZE_ID AND PRODUCTS.SECTION_ID = SECTION.SECTION_ID" + idProduct + " LIMIT 1;", (error, result) => {
        if (error) {
          console.error("Error al realizar la consulta: ", error);
          res.send(error);
          return;
        }
        res.send(result);
    });*/
    const JSON_respuesta = new JSON();
    var product;
    var colores;
    var tallas;

    conexion.query("SELECT INVENTORY.INVENTORY_ID, PRODUCTS.PRODUCT_ID, PRODUCTS.PRODUCT_NAME, INVENTORY.PRECIO, PRODUCTS.PRODUCT_DESCRIPTION, INVENTORY.SIZE_ID, INVENTORY.COLOR_ID FROM PRODUCTS, INVENTORY, COLORS, SIZES, CATEGORY, SECTION WHERE INVENTORY.PRODUCT_ID = PRODUCTS.PRODUCT_ID AND INVENTORY.COLOR_ID = COLORS.COLOR_ID AND PRODUCTS.CATEGORY_ID = CATEGORY.CATEGORY_ID AND INVENTORY.SIZE_ID = SIZES.SIZE_ID AND PRODUCTS.SECTION_ID = SECTION.SECTION_ID"+idProduct+";", (error, result1) => {
        if (error) {
          console.error("Error al realizar la consulta: ", error);
          return;
        }
        console.log("resultado sin stringify");
        console.log(result1);
        console.log("resultado stringify")
        product = JSON.stringify(result1);
        console.log(product);

        JSON_respuesta.append("product", product);
        
    });

    conexion.query("SELECT DISTINCT COLORS.COLOR_NAME, COLORS.COLOR_ID FROM COLORS, INVENTORY, PRODUCTS WHERE INVENTORY.COLOR_ID = COLORS.COLOR_ID"+idProductINV+";", (error, result2) => {
        if (error) {
          console.error("Error al realizar la consulta: ", error);
          return;
        }
        colores = JSON.stringify(result2);

        JSON_respuesta.append("colores", colores);
    });

    conexion.query("SELECT DISTINCT SIZES.SIZE_NAME, SIZES.SIZE_ID FROM SIZES, INVENTORY, PRODUCTS WHERE INVENTORY.SIZE_ID = SIZES.SIZE_ID"+idProductINV+";", (error, result3) => {
      if (error){
        console.error("Error al realizar la consulta: ", error);
        return;
      }
      tallas = JSON.stringify(result3);

      JSON_respuesta.append("tallas", tallas);
    });

    console.log("JSON respuesta: ");
    console.log(JSON_respuesta);

    res.send(JSON_respuesta);

});

//app.post("/get-product", (req, res) => {}); por el momento no encuentro que sea necesario.

//#endregion

app.listen(port, () => {
  console.log("AquilaBrand API server is currently running on port: " + port);
});
