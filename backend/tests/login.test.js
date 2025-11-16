const request = require("supertest");
const app = require("/app");
const User = require("/models/Users");
const bcrypt = ('bcryptjs');
// ^ Dependencies
// To run
// npm test

// Simulate user model and bycrypts
jest.mock("/models/Users");
jest.mock("bcryptjs");

// Test for login with standard account
describe("POST /auth/register => login", () => {

    // Test login
    Test("Test registers a user with the same process as register and then logs in", async() => {
        
        const firstName = "Rick";
        const lastName = "Leinecker";
        const email= "juela575@gmail.com";
        const password= "COP4331";
        const username = "RickL";

        const registerResponse = await request(app)
        .post('/auth/register')
        .send({ firstName, lastName, email, username, password })
        .expect(201);

        /*
        //Get user
        User.findOne.mockResolvedValue({
            _id: "6915fab55fa7852213445b7c",
            email: "juela575@gmail.com",
            password: "COP4331"
    
        });

        // Verify
        bcrypt.localeCompare.mockResolvedValue(true);

        // Send data to login API call
        const response = await request(app).post("auth/login").send({
            email: "juela575@gmail.com",
            password: "COP4331"
        });

        // Expected results: res.status, fields in the body, and _id of user
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("token", "user");
        expect(response.body._id).toBe("6915fab55fa7852213445b7c");*/


    })


});