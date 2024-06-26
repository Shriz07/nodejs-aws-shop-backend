const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { unmarshall } = require('@aws-sdk/util-dynamodb');

const client = new DynamoDBClient({ region: process.env.DB_REGION });

const headers = { 
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
    "Access-Control-Allow-Methods": "GET"
  };

exports.handler = async (event) => {
    console.log('Get products list request', JSON.stringify(event));
    const productsParams = {
        TableName: process.env.PRODUCTS_TABLE_NAME,
    }

    const stocksParams = {
        TableName: process.env.STOCKS_TABLE_NAME,
    }

    try {
        const productsResponse = await client.send(new ScanCommand(productsParams));
        const stocksResponse = await client.send(new ScanCommand(stocksParams));

        const products = [];

        productsResponse.Items?.forEach(product => {
            const productItem = unmarshall(product);
            const productId = product.id;
            const stock = stocksResponse.Items?.find(item => unmarshall(item).product_id === productId);
            
            products.push({
                description: productItem.description,
                id: productItem.id,
                price: productItem.price,
                title: productItem.title,
                count: stock?.count,
            })
        });

        return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify(products),
        };
    } catch (error) {
        console.error('Error scanning DynamoDB:', error);
        return {
            statusCode: 500,
            headers: headers,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};