const mongoose = require('mongoose');
const User = require('./models/Users');
const url = 'mongodb://localhost:27017/Users';

async function addUser(firstName, lastName, email, password) {
    try {
        await mongoose.connect(url);
        console.log("Connected to MongoDB on server");
        
        const newUser = new User({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password
        });
        
        await newUser.save();
        console.log("User created on server");
        console.log("UserID:", newUser.userID);
        
        mongoose.connection.close();
    } catch (err) {
        console.log("Error:", err.message);
    }
}

addUser('John', 'Miku', 'JohnMiku@gmail.com', 'hatsune');
addUser('Hatunse', 'Aedo', 'HatunseAedo@gmail.com', 'JohnAedo');
addUser('John', 'Miku Aedo', 'JognHatunseAedo@gmail.com', 'MikuAedo');
addUser('Richard', 'Miku', 'Leinecker@hatsune.com', 'HatsuneRichard');
