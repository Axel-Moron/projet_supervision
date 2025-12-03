
import 'dotenv/config';
import sequelize from "./config/db.js";
import User from "./models/User.js";

async function fixAdmin() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        const admin = await User.findOne({ where: { username: 'admin' } });
        if (admin) {
            admin.isAdmin = true;
            await admin.save();
            console.log('Admin user updated successfully. isAdmin is now TRUE.');
        } else {
            console.log('Admin user NOT found. Creating it...');
            await User.create({ username: "admin", password: "1234", isAdmin: true });
            console.log('Admin user created with isAdmin = TRUE.');
        }
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

fixAdmin();
