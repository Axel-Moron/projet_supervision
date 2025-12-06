import { Sequelize } from 'sequelize';
import 'dotenv/config';

const sequelize = new Sequelize({
  dialect: 'mariadb',
  host: process.env.DB_HOST || "127.0.0.1",
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "admin",
  database: process.env.DB_NAME || "supervision",
  logging: false
});

export default sequelize;