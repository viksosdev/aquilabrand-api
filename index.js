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

//#region bd-query (obtener datos de la bd)
app.get("/bd-info", (req, res) => {
  //obtener info transacciones
  conexion.query(
    "SELECT * FROM {tablas} WHERE {condicion}",
    (error, result) => {
      if (error) {
        console.error("Error al realizar la consulta: ", error);
        return;
      }
      res.send(result);
    }
  );
});

app.post("/bd-info", (req, res) => {
  //guardar carro de compras en la bd con su token
  conexion.query("INSERT INTO productos SET ?", req.body, (error, result) => {
    if (error) {
      console.error("Error al realizar la consulta: ", error);
      return;
    }
    res.send(result);
  });
});

//#region bd-productos (obtener y subir datos de productos de la bd)

app.get("/bd-productos", (req, res) => {
    console.log(req.headers.category)
    let categoria = " ";
    let seccion = " ";
    let color = " ";
    let talla = " ";
  //obtener productos y carritos de compra de la bd, LOS VALORES EN EL header DEBEN VENIR CON LOS NOMBRES, NO LOS ID'S.
  if (req.headers.color != null) {
    color = "AND COLORS.COLOR_NAME = " + req.headers.color;
  }
  if (req.headers.size != null) {
    talla = "AND SIZES.SIZE_NAME = " + req.headers.size;
  }
  if (req.headers.category != null) {
    categoria = " AND CATEGORY.CATEGORY_NAME = " + req.headers.category;
  }
  if (req.headers.section != null) {
    seccion = " AND SECTION.SECTION_NAME = " + req.headers.section;
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
  //guardar carro de compras en la bd con su token
  /*conexion.query('INSERT INTO productos SET ?', req.body, (error, result) => {
        if (error){
            console.error('Error al realizar la consulta: ', error);
            return;
        }
        res.send(result);
    });*/
});

//#endregion

app.listen(port, () => {
  console.log("AquilaBrand API server is currently running on port: " + port);
});
