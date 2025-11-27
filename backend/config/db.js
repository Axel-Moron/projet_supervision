/**
 * Configuration de la connexion à la base de données MariaDB
 * Utilise Sequelize comme ORM pour simplifier les interactions avec la base de données
 * Les paramètres de connexion sont lus depuis les variables d'environnement
 */

import {Sequelize} from 'sequelize';

const sequelize = new Sequelize({
  host: process.env.DB_HOST || "127.0.0.1",
  dialect: 'mariadb',
  username: process.env.DB_USERNAME || "db_user",
  password: process.env.DB_PASSWORD || "strong_password",
  database: process.env.DB_DATABASE || "db",
});

export default sequelize;
