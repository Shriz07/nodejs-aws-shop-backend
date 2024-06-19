const { handler } = require("../../resources/lambda/getProductsList");
const products = require("../../resources/lambda/products");

describe('Get product by Id', () => {
    test('Should return list of products', async () => {
        const event = {};

        const result = await handler(event);

        expect(result.statusCode).toBe(200);
        expect(result.headers["Content-Type"]).toBe("application/json");
        expect(result.body).toBe(JSON.stringify(products));
    });
});