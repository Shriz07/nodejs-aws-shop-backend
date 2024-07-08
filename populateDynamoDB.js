const AWS = require('aws-sdk');
const faker = require('faker');
const { v4: uuidv4 } = require('uuid');

AWS.config.update({
    region: 'YOUR_REGION',
    accessKeyId: 'YOUR_KEY',
    secretAccessKey: 'YOUR_SECRET'
});

const docClient = new AWS.DynamoDB.DocumentClient();

const productsTableName = 'products';
const stocksTableName = 'stocks';

const generateRandomProducts = (numProducts) => {
    const products = [];
    for (let i = 1; i <= numProducts; i++) {
        const productId = uuidv4();
        products.push({
            description: faker.commerce.productDescription(),
            id: productId,
            price: parseFloat(faker.commerce.price()),
            title: faker.commerce.productName(),
        });
    }
    return products;
};

const generateRandomStocks = (products) => {
    return products.map(product => ({
        product_id: product.id,
        count: Math.floor(Math.random() * 100) + 1,
    }));
};

const sampleProducts = generateRandomProducts(10); // Specify number of products to generate
const sampleStocks = generateRandomStocks(sampleProducts);

const populateProducts = async () => {
    for (const item of sampleProducts) {
        const params = {
            TableName: productsTableName,
            Item: item
        };

        try {
            await docClient.put(params).promise();
        console.log(`Added item: ${JSON.stringify(item)}`);
        } catch (err) {
            console.error(`Unable to add item. Error JSON: ${JSON.stringify(err, null, 2)}`);
        }
    }
};

const populateStocks = async () => {
    for (const item of sampleStocks) {
        const params = {
            TableName: stocksTableName,
            Item: item
        };

        try {
            await docClient.put(params).promise();
        console.log(`Added item: ${JSON.stringify(item)}`);
        } catch (err) {
            console.error(`Unable to add item. Error JSON: ${JSON.stringify(err, null, 2)}`);
        }
    }
};

populateProducts().then(() => {
    console.log('Sample products has been added to the table.');
    populateStocks().then(() => {
        console.log('Sample stocks has been added to the table.');
    });
}).catch((err) => {
    console.error('Failed to populate table:', err);
});