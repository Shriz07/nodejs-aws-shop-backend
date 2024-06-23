const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { unmarshall } = require('@aws-sdk/util-dynamodb');

const client = new DynamoDBClient({ region: process.env.DB_REGION });

const headers = { 
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
    "Access-Control-Allow-Methods": "GET"
  };

exports.handler = async (event) => {
    console.log(`Recived get products list request`);
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

        stocksResponse.Items.forEach(stock => {
            const stockItem = unmarshall(stock);
            const productId = stockItem.product_id;
            const product = productsResponse.Items.find(item => unmarshall(item).id === productId);
            if (product) {
                const productItem = unmarshall(product);
                products.push({
                    description: productItem.description,
                    id: productItem.id,
                    price: productItem.price,
                    title: productItem.title,
                    count: stockItem.count,
                });
            }
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
            body: JSON.stringify({ error: 'Could not scan DynamoDB' }),
        };
    }
};