const { handler } = require("../../resources/lambda/getProductsById");
const products = require("../../resources/lambda/products");

describe('Get product by Id', () => {
    test('Should return product for a valid productId', async () => {
        const event = {
            pathParameters: {
                productId: "1"
            }
        };

        const result = await handler(event);

        expect(result.statusCode).toBe(200);
        expect(result.headers["Content-Type"]).toBe("application/json");
        expect(result.body).toBe(JSON.stringify(products[0]));
    });

    test('Should return 404 for an invalid productId', async () => {
        const event = {
            pathParameters: {
                productId: "000"
            }
        };

        const result = await handler(event);

        expect(result.statusCode).toBe(404);
        expect(result.headers["Content-Type"]).toBe("application/json");
        expect(result.body).toBe(JSON.stringify({ "message": "Product not found" }));
    });
});