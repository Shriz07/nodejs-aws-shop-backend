const products = require('./products.js');

exports.handler = async (event) => {
    const productId = event.pathParameters.productId;
    const product = products.find(prod => prod.id === productId);

    const notFoundResponse = {
      "message": "Product not found"
    };

    if (product) {
        return {
          statusCode: 200,
          headers: { 
              "Access-Control-Allow-Origin": "*",
              "Content-Type": "application/json",
              "Access-Control-Allow-Methods": "GET"
          },
          body: JSON.stringify(product),
      };
    } else {
      return {
        statusCode: 404,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
            "Access-Control-Allow-Methods": "GET"
        },
        body: JSON.stringify(notFoundResponse),
      }
    }
};