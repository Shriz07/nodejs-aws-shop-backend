const { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

const client = new DynamoDBClient({ region: process.env.DB_REGION });

const headers = { 
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
  "Access-Control-Allow-Methods": "GET"
};

exports.handler = async (event) => {
    console.log('Get product by ID request', JSON.stringify(event));
    const notFoundResponse = {
      "message": "Product not found"
    };
    const productId = event.pathParameters.productId;

    const productsParams = {
      TableName: process.env.PRODUCTS_TABLE_NAME,
      Key: marshall({ id: productId })
    }

    const stocksParams = {
      TableName: process.env.STOCKS_TABLE_NAME,
      Key: marshall({ product_id: productId })
    }

    try {
        const productResponse = await client.send(new GetItemCommand(productsParams));
        const stockResponse = await client.send(new GetItemCommand(stocksParams));

        const product = productResponse.Item ? unmarshall(productResponse.Item) : null;
        const stock = stockResponse.Item ? unmarshall(stockResponse.Item) : null;

        if (product) {
          const response = {
            description: product.description,
            id: product.id,
            price: product.price,
            title: product.title,
            count: stock?.count,
          };
          return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify(response),
          };
        } else {
          return {
            statusCode: 404,
            headers: headers,
            body: JSON.stringify(notFoundResponse),
          };
        }
    } catch (error) {
        console.error('Error fetching item from DynamoDB:', error);
        return {
          statusCode: 500,
          headers: headers,
          body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
