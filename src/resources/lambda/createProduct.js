const { DynamoDBClient, TransactWriteItemsCommand } = require('@aws-sdk/client-dynamodb');
const { marshall } = require('@aws-sdk/util-dynamodb');

const client = new DynamoDBClient({ region: process.env.DB_REGION });

const headers = { 
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
  "Access-Control-Allow-Methods": "POST"
};

exports.handler = async (event) => {
    const body = JSON.parse(event.body);
    console.log(`Recived create product request with body ${JSON.stringify(body)}`);
    const { id, count, price, title, description } = body;

    const validateInput = (body) => {
      if (typeof body.id !== 'string') return 'Invalid type for id, expected string';
      if (body.id === '') return 'Id cannot be empty';
      if (typeof body.count !== 'number' || !Number.isInteger(body.count)) return 'Invalid type for count, expected integer';
      if (body.count < 0) return 'Stock cannot be below 0';
      if (typeof body.price !== 'number') return 'Invalid type for price, expected double';
      if (body.price <= 0) return 'Price cannot be below or equal 0';
      if (typeof body.title !== 'string') return 'Invalid type for title, expected string';
      if (body.title === '') return 'Title cannot be empty';
      if (typeof body.description !== 'string') return 'Invalid type for description, expected string';
      return null;
    };

    const validationError = validateInput(body);
    if (validationError) {
        return {
            statusCode: 400,
            headers: headers,
            body: JSON.stringify({ error: validationError }),
        };
    }

    const productsTableName = process.env.PRODUCTS_TABLE_NAME;
    const stocksTableName = process.env.STOCKS_TABLE_NAME;

    const transactParams = {
        TransactItems: [
            {
                Put: {
                    TableName: productsTableName,
                    Item: marshall({
                        id,
                        price,
                        title,
                        description
                    })
                }
            },
            {
                Put: {
                    TableName: stocksTableName,
                    Item: marshall({
                        product_id: id,
                        count
                    })
                }
            }
        ]
    };

    try {
        await client.send(new TransactWriteItemsCommand(transactParams));

        const response = {
            statusCode: 201,
            headers: headers,
            body: JSON.stringify({ message: 'Product created successfully' }),
        };
        
        return response;
    } catch (error) {
        console.error('Error performing transaction in DynamoDB:', error);
        
        return {
            statusCode: 500,
            headers: headers,
            body: JSON.stringify({ error: 'Could not create product' }),
        };
    }
};
