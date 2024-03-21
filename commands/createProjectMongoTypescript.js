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
      mongoose: "^8.2.2",
      nodemon: "^3.1.0",
      typescript: "^5.4.2",
    },
    devDependencies: {
      "@types/express": "^4.17.13",
    },
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
    MONGO_URI=mongodb://
`;

  fs.writeFileSync('.env.example', env);

  // Create the 'src' directory
  fs.mkdirSync(path.join(projectPath, 'src'));

  // Create the 'db' directory
  fs.mkdirSync(path.join(projectPath, 'src/db'));

  // Create db.ts in the 'db' directory
  const dbJs = `
      import mongoose from 'mongoose';
      import dotenv from 'dotenv';
      dotenv.config();
      const MONGO_URI: any = process.env.MONGO_URI;
      export default {
          connect: async () => {
              try {
                  await mongoose.connect(MONGO_URI, {
                      // useNewUrlParser: true, // uncomment this line if you are using mongoose version 5 and above
                      // useUnifiedTopology: true, // uncomment this line if you are using mongoose version 5 and above
                      // useCreateIndex: true, // uncomment this line if you are using mongoose version 5 and above
                      // useFindAndModify: false // uncomment this line if you are using mongoose version 5 and above
                  });
                  console.log('MongoDB connected');
              } catch (error) {
                  console.error('Error connecting to MongoDB:', error);
              }
          }
      };
  

  `;

  fs.writeFileSync('src/db/db.ts', dbJs);

  // Create the 'controller' directory
  fs.mkdirSync(path.join(projectPath, 'src/controller'));

  // Create userController.ts in the 'controller' directory
  const userControllerJs = `
 
import { Request, Response } from 'express';
import User from '../schema/userSchema'; // Importing the default export

const apicontroller: any = {}; // Define type for apicontroller as needed

apicontroller.getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

apicontroller.addUsers = async (req: Request, res: Response) => {
  const fullname: string = req.body.fullname;
  const username: string = req.body.username;
  const email: string = req.body.email;
  const password: string = req.body.password;
  
  const user = new User({
    fullname,
    username,
    email,
    password,
  });

  try {
    const newUser = await user.save();
    res.status(201).json({ status: true, message: 'User added successfully!' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

apicontroller.getUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json({ status: true, data: user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

apicontroller.updateUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.fullname = req.body.fullname;
    user.username = req.body.username;
    user.email = req.body.email;
    user.password = req.body.password;
    const updatedUser = await user.save();
    res.status(200).json({ status: true, message: 'User updated successfully!', data: updatedUser });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

apicontroller.deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await user.deleteOne({ _id: req.params.id });
    res.status(200).json({ status: true, message: 'User deleted successfully!' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

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
  import database from './db/db';
  import userRoute from './route/userRoute';
  
  const app = express();
  app.use(express.json());
  const PORT: number = parseInt(process.env.PORT || '3000');
  
  // Require your routes and use them here
  app.use('/api', userRoute);
  database.connect()
  app.listen(PORT, () => {
    console.log(\`Server is running on http://localhost:\${PORT}\`);
  });
  `;

  fs.writeFileSync('src/index.ts', indexJs);



};


// module.exports = createProject;
export default createProject;
