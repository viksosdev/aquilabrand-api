const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const fetch = require('node-fetch');

const app = express();
const port = 3000;

conexion = mysql.createConnection({
    host: 'db4free.net',
    user: 'coitoscrew',
    password: 'coitosporsiempre2023',
    database: 'aquilabrand'
});

conexion.connect((error) => {
    if (error){
        console.error('Error al conectar a la base de datos: ', error);
        return;
    }
});

app.use(
    express.urlencoded({
        extended: true
    })
)

app.use(express.json({
    type: "*/*"
}))

app.use(cors());


//#region headers (headers con info de la tienda)
//const myHeaders = new Headers();
//myHeaders.append("Tbk-Api-Key-Id", "597055555532");
//myHeaders.append("Tbk-Api-Key-Secret", "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C");
//myHeaders.append("Content-Type", "application/json");

const requestOptions = { 
    http_version: "HTTP/2.0",
    maxredirects: 10,
    redirect: "follow"
}


//#region final-checkout (obtener token)
app.post('/final-checkout', (req, res) => {
    fetch("https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions", { 
        method: "POST",
        requestOptions,
        headers: {
            "Tbk-Api-Key-Id": "597055555532",
            "Tbk-Api-Key-Secret": "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(req.body)
    })
    .then(response => response.json())
    .then((result) => {
        res.send(result);
    })

    .catch((error) => res.send('ERROR!', error));
});
//#endregion

//#region payment-result (obtener datos de la transaccion)
app.get('/final-checkout', (req, res) => {
    token = req.headers.token;
    fetch("https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions/"+token, {
        method: "PUT",
        requestOptions,
        headers: {
            "Tbk-Api-Key-Id": "597055555532",
            "Tbk-Api-Key-Secret": "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C",
            "Content-Type": "application/json"
        }
    })
    .then(response => response.json())
    .then((result) => {
        res.send(result);
    })
});
//#endregion

//#region bd-query (obtener datos de la bd)
app.get('/bd-info', (req, res) => { //obtener info transacciones
    conexion.query('SELECT * FROM {tablas} WHERE {condicion}', (error, result) => {
        if (error){
            console.error('Error al realizar la consulta: ', error);
            return;
        }
        res.send(result);
    });
});

app.post('/bd-info', (req, res) => { //guardar carro de compras en la bd con su token
    conexion.query('INSERT INTO productos SET ?', req.body, (error, result) => {
        if (error){
            console.error('Error al realizar la consulta: ', error);
            return;
        }
        res.send(result);
    });
});

//#region bd-productos (obtener y subir datos de productos de la bd)

app.get('/bd-productos', (req, res) => { //obtener productos y carritos de compra de la bd.
    if(req.body.category != null){
        category_condition = 'product.category_id = ' + req.body.category;
    }
    if(req.body.filtros == null){ // si no se especifican filtros, se ejecuta la query por defecto
    /*conexion.query('SELECT DISTINCT products.PRODUCT_ID, products.PRODUCT_NAME, products.PRODUCT_DESCRIPTION, images.IMAGE_PATH, inventory.PRECIO, category.CATEGORY_NAME, category.CATEGORY_ID FROM images, inventory, products, category WHERE products.PRODUCT_ID = inventory.PRODUCT_ID AND category.CATEGORY_ID = products.CATEGORY_ID;', (error, result) => { //HACER que se haga una query especifica segun lo que cambia);
        if (error){
            console.error('Error al realizar la consulta: ', error);
            return;
        }
        res.send(result);
    });}
    else{
    conexion.query('SELECT * FROM inventory, products, images, category  WHERE  products.product_id = inventory.product_id', (error, result) => { //HACER que se haga una query especifica segun lo que cambia
        if (error){
            console.error('Error al realizar la consulta: ', error);
            return;
        }
        res.send(result);
    });*/
}});

app.post('/bd-productos', (req, res) => { //guardar carro de compras en la bd con su token
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