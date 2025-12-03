
import 'dotenv/config';
import sequelize from "./config/db.js";
import User from "./models/User.js";

async function checkAdmin() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        const admin = await User.findOne({ where: { username: 'admin' } });
        if (admin) {
            console.log('Admin user found:', JSON.stringify(admin.toJSON(), null, 2));
            console.log('isAdmin type:', typeof admin.isAdmin);
            console.log('isAdmin value:', admin.isAdmin);
        } else {
            console.log('Admin user NOT found');
        }
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

checkAdmin();
