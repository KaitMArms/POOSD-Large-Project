require('dotenv').config(); 
const mongoose = require('mongoose');
const UserModel = require('./models/Users');

const DB_URI_USERS = process.env.MONGO_URI_USERS;

const testUserGames = [
    {
        id: 266733, 
        name: "Final Fantasy VII Rebirth: Digital Deluxe Edition",
        status: 'completed',
        isLiked: true 
    },
    {
        id: 2407, 
        name: "Crisis Core: Final Fantasy VII",
        status: 'completed',
        isLiked: true
    },
    {
        id: 266734, 
        name: "Final Fantasy VII Rebirth: Deluxe Edition",
        status: 'completed',
        isLiked: true
    },
    {
        id: 119374, 
        name: "Final Fantasy VIII Remastered",
        status: 'completed',
        isLiked: true
    },
    {
        id: 207026, 
        name: "Final Fantasy VII",
        status: 'completed',
        isLiked: true
    },
    {
        id: 115282, 
        name: "Final Fantasy VIII Remastered",
        status: 'completed',
        isLiked: true
    },
    {
        id: 119374, 
        name: "Tetris 99",
        status: 'completed',
        isLiked: true
    },
    {
        id: 2155, 
        name: "Dark Souls",
        status: 'completed',
        isLiked: true
    },
    {
        id: 17000, 
        name: "Stardew Valley",
        status: 'completed',
        isLiked: true
    },
    {
        id: 1879, 
        name: "Terraria",
        status: 'completed',
        isLiked: true
    }
];

async function addUserWithGames(firstName, lastName, email, password, gamesToAdd) {
    let connection;
    try {
        connection = await mongoose.createConnection(DB_URI_USERS).asPromise();
        console.log(`Connected to MongoDB: ${connection.name}`);

        const User = connection.model('User', UserModel.schema);

        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            console.log(`User with email ${email} already exists. Skipping.`);
            return; 
        }
        
        const newUser = new User({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password, 
            userGames: gamesToAdd 
        });
        
        await newUser.save();
        console.log(`User '${email}' created successfully with ${gamesToAdd.length} games.`);

    } catch (err) {
        console.error(`Error creating user '${email}':`, err.message);
    } finally {
        if (connection) {
            await connection.close();
            console.log("Connection closed.");
        }
    }
}

async function createTestUsers() {
    console.log("--- Starting to create test users ---");
    
    await addUserWithGames('Gage', 'Lappin', 'GageLappin119@gmail.com', 'password', testUserGames);
    
    await addUserWithGames('Hatunse', 'Aedo', 'HatunseAedo@gmail.com', 'JohnAedo', [
        { id: 3008, name: "Baldur's Gate 3", status: 'in-progress', isLiked: true }
    ]);
    
    await addUserWithGames('John', 'Miku Aedo', 'JognHatunseAedo@gmail.com', 'MikuAedo', []);
    
    console.log("\n--- Finished creating test users ---");
}

createTestUsers();
