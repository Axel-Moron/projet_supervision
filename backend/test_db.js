
import sequelize from "./config/db.js";
import User from "./models/User.js";

async function fixAdmin() {
    try {
        await sequelize.authenticate();
        console.log('✅ DB Connected.');

        await sequelize.sync();

        let admin = await User.findOne({ where: { username: "admin" } });
        if (admin) {
            console.log(`👤 Admin found. ID: ${admin.id}, IsAdmin: ${admin.isAdmin}`);
            // Force reset password
            admin.password = "1234";
            admin.isAdmin = true;
            await admin.save();
            console.log("✅ Admin password reset to '1234' and isAdmin set to true.");
        } else {
            console.log("⚠️ Admin not found. Creating...");
            await User.create({ username: "admin", password: "1234", isAdmin: true });
            console.log("✅ Admin created with password '1234'.");
        }

        const users = await User.findAll();
        console.log("📋 All Users:");
        users.forEach(u => console.log(` - ${u.username} (Admin: ${u.isAdmin})`));

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await sequelize.close();
    }
}

fixAdmin();
