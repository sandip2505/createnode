import fs from 'fs';
import path from 'path';

import {execSync} from 'child_process';


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
      mongoose: '^6.2.1',
      nodemon: "^3.1.0",

    },
  };

  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

  // Change to the project directory
  process.chdir(projectPath);

  // Create .env file
  const env = `
    PORT=3000
    MONGO_URI=mongodb://
    TYPESCRIPT=true

`;

  fs.writeFileSync('.env', env);

  // Create the 'src' directory
  fs.mkdirSync(path.join(projectPath, 'src'));

  // Create the 'db' directory
  fs.mkdirSync(path.join(projectPath, 'src/db'));

  // Create db.js in the 'db' directory
  const dbJs = `
        const mongoose = require('mongoose');
        require('dotenv').config()
        mongoose.set("strictQuery", false);

        mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }).then(() => {
            console.log('Connected to MongoDB');
        }).catch((err) => {
            console.log(err);
        });

        module.exports = mongoose;

  `;

  fs.writeFileSync('src/db/db.js', dbJs);

  // Create the 'controller' directory
  fs.mkdirSync(path.join(projectPath, 'src/controller'));

  // Create userController.js in the 'controller' directory
  const userControllerJs = `
  const apicontroller = {};
  const User = require('../schema/userSchema');
  
  
  apicontroller.getAllUsers = async (req, res) => {
    try {
      const users = await User.find();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  
  apicontroller.addUsers = async (req, res) => {
    const user = new User({
      fullname: req.body.fullname,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    });
  
    try {
      const newUser = await user.save();
      res.status(201).json({status: true, message: 'User added successfully!'});
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  
  apicontroller.getUser = async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      res.status(200).json({status: true, data: user});
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  
  apicontroller.updateUser = async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      user.fullname = req.body.fullname;
      user.username = req.body.username;
      user.email = req.body.email;
      user.password = req.body.password;
      const updatedUser = await user.save();
      res.status(200).json({status: true, message: 'User updated successfully!', data: updatedUser});
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  
  apicontroller.deleteUser = async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      const deletedUser = await user.remove();
      res.status(200).json({status: true, message: 'User deleted successfully!'});
    } catch (error) {
      res.status(500).json({ message: error.message });
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
  const mongoose = require('mongoose');

  const userSchema = new mongoose.Schema({
    fullname: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
  });
  
  const User = mongoose.model('User', userSchema);
  
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
