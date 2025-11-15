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

test("POST ../backend/auth/login", () => {
    
});