const { DynamoDBClient, TransactWriteItemsCommand } = require('@aws-sdk/client-dynamodb');
const { marshall } = require('@aws-sdk/util-dynamodb');
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({ region: process.env.DB_REGION });

const headers = { 
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
  "Access-Control-Allow-Methods": "POST"
};

const validateInput = (body) => {
    if (typeof body.count !== 'number' || !Number.isInteger(body.count)) return 'Invalid type for count, expected integer';
    if (body.count < 0) return 'Stock cannot be below 0';
    if (typeof body.price !== 'number') return 'Invalid type for price, expected double';
    if (body.price <= 0) return 'Price cannot be below or equal 0';
    if (typeof body.title !== 'string') return 'Invalid type for title, expected string';
    if (body.title === '') return 'Title cannot be empty';
    if (typeof body.description !== 'string') return 'Invalid type for description, expected string';
    return null;
  };

exports.handler = async (event) => {
    const body = JSON.parse(event.body);
    console.log('Create product request', JSON.stringify(body));
    const { count, price, title, description } = body;

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

    const productId = uuidv4();

    const transactParams = {
        TransactItems: [
            {
                Put: {
                    TableName: productsTableName,
                    Item: marshall({
                        id: productId,
                        price: price,
                        title: title,
                        description: description
                    })
                }
            },
            {
                Put: {
                    TableName: stocksTableName,
                    Item: marshall({
                        product_id: productId,
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
