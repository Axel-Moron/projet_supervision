import {Sequelize} from 'sequelize';
import 'dotenv/config'; 

const sequelize = new Sequelize({
  host: process.env.DB_HOST || "127.0.0.1",
  dialect: 'mariadb',
  username: process.env.DB_USERNAME || "db_user",
  password: process.env.DB_PASSWORD || "strong_password",
  // CHANGEMENT ICI : On met "supervision"
  database: process.env.DB_DATABASE || "supervision", 
  logging: false
});

export default sequelize;