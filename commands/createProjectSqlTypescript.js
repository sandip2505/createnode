import fs from 'fs';
import path from 'path';

import { execSync } from 'child_process';


const createProject = async (projectName, authername) => {
  const projectPath = path.join(process.cwd(), projectName);

  // Create the project directory
  fs.mkdirSync(projectPath);

  // Change to the project directory
  process.chdir(projectPath);

  // Create package.json
  const packageJson = {
    name: projectName,
    version: '1.0.0',
    main: 'index.js', // Updated to reflect the new structure
    scripts: {
      start: 'nodemon dist/index.js', // Updated to reflect the new structure
    },
    author: authername ? authername : '',
    dependencies: {
      dotenv: "^16.4.5",
      express: '^4.17.1',
      mysql2: "^3.9.2",
      nodemon: "^3.1.0",
      sequelize: "^6.37.1",
      typescript: "^5.4.2",

    },
    devDependencies: {
      "@types/express": "^4.17.13"
    }
  };

  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

    // Create tsconfig.json
    const tsconfigJson = {
      compilerOptions: {
        target: 'ES2018',
        module: 'commonjs',
        outDir: './dist',
        esModuleInterop: true,
        forceConsistentCasingInFileNames: true,
        strict: true,
        skipLibCheck: true,
  
      },
      include: ['./src/**/*.ts'],
      exclude: ['node_modules'],
    };
  
    fs.writeFileSync('tsconfig.json', JSON.stringify(tsconfigJson, null, 2));

  // Change to the project directory
  process.chdir(projectPath);

  // Create .env.example file
  const env = `
  PORT=3000
  DB_HOST=localhost
  DB_USER=root
  DB_PASSWORD=
  DB_NAME=sequelize_test
  DB_DIALECT=mysql
  TYPESCRIPT=true

`;

  fs.writeFileSync('.env.example', env);

  // Create the 'src' directory
  fs.mkdirSync(path.join(projectPath, 'src'));

  // Create the 'db' directory
  fs.mkdirSync(path.join(projectPath, 'src/db'));

  // Create db.ts in the 'db' directory
  const config = `
  import { Sequelize, Dialect } from 'sequelize';
  import dotenv from 'dotenv';
  dotenv.config();
  
  // Define your Sequelize configuration
  const sequelizeConfig: {
    [key: string]: string | undefined; // Define the type of values for properties
    database?: string;
    username?: string;
    password?: string;
    host?: string;
    dialect?: Dialect;
  } = {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT as Dialect | undefined, // Cast to Dialect type or undefined
  };
  
  // Remove undefined values from the configuration object
  const filteredConfig: Record<string, string> = {};
  for (const [key, value] of Object.entries(sequelizeConfig)) {
    if (value !== undefined) {
      filteredConfig[key] = value;
    }
  }
  
  const sequelize = new Sequelize(filteredConfig);
  
  sequelize.authenticate()
    .then(() => {
      console.log('Connection has been established successfully.');
    })
    .catch((error: any) => {
      console.error('Unable to connect to the database: ', error);
    });
  
  export default sequelize;
  
  `;

  fs.writeFileSync('src/db/db.ts', config);


  // Create the 'controller' directory
  fs.mkdirSync(path.join(projectPath, 'src/controller'));

  // Create userController.ts in the 'controller' directory
  const userControllerJs = `
  
  import { Request, Response } from 'express';
  import User from '../schema/userSchema';
  
  const apicontroller: any = {};
  
  apicontroller.getAllUsers = async (req: Request, res: Response) => {
    try {
      const users = await User.find();
  
      if (!users || users.length === 0) {
        return res.status(404).json({ status: false, message: 'No users found' });
      }
  
      res.status(200).json({ status: true, data: users });
    } catch (error: any) {
      console.error('Error retrieving users:', error);
      res.status(500).json({ status: false, message: 'Error retrieving users', error: error.message });
    }
  }
  
  apicontroller.addUsers = async (req: Request, res: Response) => {
    const { fullname, username, email, password } = req.body;
  
    try {
      const newUser = await User.create({
        fullname,
        username,
        email,
        password,
      });
  
      res.status(201).json({ status: true, message: 'User added successfully!', data: newUser });
    } catch (error: any) {
      console.error('Error adding user:', error);
      res.status(400).json({ status: false, message: 'Error adding user', error: error.message });
    }
  }
  
  apicontroller.getUser = async (req: Request, res: Response) => {
    const userId = req.params.id;
  
    try {
      const user = await User.findOne({
        where: { id: userId },
      });
  
      if (!user) {
        return res.status(404).json({ status: false, message: 'User not found' });
      }
  
      res.status(200).json({ status: true, data: user });
    } catch (error: any) {
      console.error('Error retrieving user:', error);
      res.status(500).json({ status: false, message: 'Error retrieving user', error: error.message });
    }
  }
  
  apicontroller.updateUser = async (req: Request, res: Response) => {
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
    } catch (error: any) {
      console.error('Error updating user:', error);
      res.status(500).json({ status: false, message: 'Error updating user', error: error.message });
    }
  }
  
  apicontroller.deleteUser = async (req: Request, res: Response) => {
    const userId = req.params.id;
  
    try {
      const user = await User.findOneAndDelete({ _id: userId });
  
      if (!user) {
        return res.status(404).json({ status: false, message: 'User not found' });
      }
  
      res.status(200).json({ status: true, message: 'User deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      res.status(500).json({ status: false, message: 'Error deleting user', error: error.message });
    }
  }
  
  export default apicontroller;
  
  `;

  fs.writeFileSync('src/controller/userController.ts', userControllerJs);

  // Create the 'route' directory
  fs.mkdirSync(path.join(projectPath, 'src/route'));

  // Create userRoute.ts in the 'route' directory
  const userRouteJs = `

  import express from 'express';
  const router = express.Router();
  import userController from '../controller/userController';
  
  router.get('/users', userController.getAllUsers);
  router.post('/user', userController.addUsers);
  router.get('/user/:id', userController.getUser);
  router.put('/user/:id', userController.updateUser);
  router.delete('/user/:id', userController.deleteUser);
  
  
  export default router;
  `;

  fs.writeFileSync('src/route/userRoute.ts', userRouteJs);

  // Create the 'schema' directory
  fs.mkdirSync(path.join(projectPath, 'src/schema'));

  // Create userRoute.ts in the 'route' directory
  const userSchema = `
  import mongoose, { Schema, Document, Model } from 'mongoose';

  interface IUser extends Document {
    fullname: string;
    username: string;
    email: string;
    password: string;
  }
  
  const userSchema: Schema<IUser> = new Schema<IUser>({
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
  
  const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
  
  export default User;  
  
  `;

  fs.writeFileSync('src/schema/userSchema.ts', userSchema);

  // Create index.ts in the 'src' directory
  const indexJs = `
import express from 'express';
import sequelize from './db/db'; 
import userRoute from './route/userRoute';

const app = express();
app.use(express.json());
const PORT: number = parseInt(process.env.PORT || '3000');

app.use('/api', userRoute);

sequelize.authenticate() 
  .then(() => {
    app.listen(PORT, () => {
      console.log(\`Server is running on http://localhost:$\{PORT}\`);
    });
  })
  .catch((error: any) => {
    console.error('Unable to connect to the database:', error);
  });

  `;

  fs.writeFileSync('src/index.ts', indexJs);


};

// module.exports = createProject;
export default createProject;
