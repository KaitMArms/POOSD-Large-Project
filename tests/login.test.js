const request = require("supertest");
const app = require("../backend/app");
const User = require("../backend/models/Users");
const bcrypt = ('bycryptjs');
// ^ Dependencies
// To run
// npm test

// Simulate user model and bycrypts
jest.mock("../backend/models/Users");
jest.mock("bycryptjs");

// Test for login with standard account
describe("POST ../backend/auth/login", () => {

    // Test login
    Test("Returns token, id, name, email, lastname, role, emailverified, userID, otpLastSentAt", async() => {
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
        expect(response.body._id).toBe("6915fab55fa7852213445b7c");


    })


});