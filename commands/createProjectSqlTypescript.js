import fs from 'fs';
import path from 'path';

import { execSync } from 'child_process';


const createProject = async (projectName,authername) => {
  const projectPath = path.join(process.cwd(), projectName);

  // Create the project directory
  fs.mkdirSync(projectPath);

  // Change to the project directory
  process.chdir(projectPath);

  // Create package.json
  const packageJson = {
    name: projectName,
    version: '1.0.0',
    main: 'src/index.js', // Updated to reflect the new structure
    scripts: {
      start: 'nodemon src/index.js', // Updated to reflect the new structure
    },
    author: authername?authername:'',
    dependencies: {
      dotenv: "^16.4.5",
      express: '^4.17.1',
      sequelize: "^6.37.1",
      mysql2: "^3.9.2",
      nodemon: "^3.1.0",

    },
  };

  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

  // Change to the project directory
  process.chdir(projectPath);

  // Create .env file
  const env = `
  PORT=3000
  DB_HOST=localhost
  DB_USER=root
  DB_PASSWORD=
  DB_NAME=sequelize_test
  DB_DIALECT=mysql
  TYPESCRIPT=true

`;

  fs.writeFileSync('.env', env);

  // Create the 'src' directory
  fs.mkdirSync(path.join(projectPath, 'src'));

  // Create the 'db' directory
  fs.mkdirSync(path.join(projectPath, 'src/db'));

  // Create db.js in the 'db' directory
  const config = `
          const { Sequelize } = require('sequelize');
          require('dotenv').config()
          const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
            host: process.env.DB_HOST,
            dialect: process.env.DB_DIALECT,
          });

          
          sequelize.authenticate().then(() => {
            console.log('Connection has been established successfully.');
        }).catch((error) => {
            console.error('Unable to connect to the database: ', error);
        });

          module.exports = sequelize;
  
  `;

  fs.writeFileSync('src/db/db.js', config);


  // Create the 'controller' directory
  fs.mkdirSync(path.join(projectPath, 'src/controller'));

  // Create userController.js in the 'controller' directory
  const userControllerJs = `
  
const apicontroller = {};
const User = require('../schema/userSchema');


apicontroller.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();

    if (!users || users.length === 0) {
      return res.status(404).json({ status: false, message: 'No users found' });
    }

    res.status(200).json({ status: true, data: users });
  } catch (error) {
    console.error('Error retrieving users:', error);
    res.status(500).json({ status: false, message: 'Error retrieving users', error: error.message });
  }
}

apicontroller.addUsers = async (req, res) => {
  const { fullname, username, email, password } = req.body;

  try {
    const newUser = await User.create({
      fullname,
      username,
      email,
      password,
    });

    res.status(201).json({ status: true, message: 'User added successfully!', data: newUser });
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(400).json({ status: false, message: 'Error adding user', error: error.message });
  }
}

apicontroller.getUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findOne({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    res.status(200).json({ status: true, data: user });
  } catch (error) {
    console.error('Error retrieving user:', error);
    res.status(500).json({ status: false, message: 'Error retrieving user', error: error.message });
  }
}

apicontroller.updateUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findOne({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    user.fullname = req.body.fullname || user.fullname;
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.password = req.body.password || user.password;

    await user.save();

    res.status(200).json({ status: true, message: 'User updated successfully', data: user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ status: false, message: 'Error updating user', error: error.message });
  }
}

apicontroller.deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findOne({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    await user.destroy();

    res.status(200).json({ status: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ status: false, message: 'Error deleting user', error: error.message });
  }
}

module.exports = apicontroller;
  `;

  fs.writeFileSync('src/controller/userController.js', userControllerJs);

  // Create the 'route' directory
  fs.mkdirSync(path.join(projectPath, 'src/route'));

  // Create userRoute.js in the 'route' directory
  const userRouteJs = `

  const express = require('express');
  const router = express.Router();
  const userController = require('../controller/userController');

  router.get('/users', userController.getAllUsers);
  router.post('/user', userController.addUsers);
  router.get('/user/:id', userController.getUser);
  router.put('/user/:id', userController.updateUser);
  router.delete('/user/:id', userController.deleteUser);

  module.exports = router;
  `;

  fs.writeFileSync('src/route/userRoute.js', userRouteJs);

  // Create the 'schema' directory
  fs.mkdirSync(path.join(projectPath, 'src/schema'));

  // Create userRoute.js in the 'route' directory
  const userSchema = `
  const { DataTypes } = require('sequelize');
  const sequelize = require('../db/db');
  
  const User = sequelize.define('User', {
    fullname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      lowercase: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  
  module.exports = User;
  
  `;

  fs.writeFileSync('src/schema/userSchema.js', userSchema);

  // Create index.js in the 'src' directory
  const indexJs = `
    const express = require('express');
    const mongoose = require('./db/db');
    const app = express();
    app.use(express.json());
    const PORT = process.env.PORT || 3000;

    // Require your routes and use them here
    const userRoute = require('./route/userRoute');
    app.use('/users', userRoute);

    app.listen(PORT, () => {
      console.log(\`Server is running on http://localhost:\${PORT}\`);
    });
  `;

  fs.writeFileSync('src/index.js', indexJs);

  // Install dependencies
  execSync('npm install');

};

// module.exports = createProject;
export default createProject;
