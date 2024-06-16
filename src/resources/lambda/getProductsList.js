const products = require('./products.js');

exports.handler = async (event) => {

    return {
        statusCode: 200,
        headers: { 
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
            "Access-Control-Allow-Methods": "GET"
         },
        body: JSON.stringify(products),
    };
};