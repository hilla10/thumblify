import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

// Controllers for user registration
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, name, password } = req.body;

    // Finder user by email
    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    //   User input validation

    const validateEmail = emailRegex.test(email);

    if (!validateEmail) {
      return res
        .status(400)
        .json({ message: 'Please enter a valid email address.' });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    const validatePassword = passwordRegex.test(password);

    if (!validatePassword) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters long and include at least one uppercase, lowercase, digits, and special characters.',
      });
    }

    // Encrypt the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashedPassword });

    await newUser.save();

    // Setting user data in session
    req.session.isLoggedIn = true;
    req.session.userId = newUser._id;

    return res.status(201).json({
      message: 'Account Created Successfully',
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: error.message || 'Server Error!' });
  }
};

// Controllers for user login
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Finder user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ message: 'Invalid Email or Password! Please try again.' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res
        .status(400)
        .json({ message: 'Invalid Email or Password! Please try again.' });
    }

    // Setting user data in session
    req.session.isLoggedIn = true;
    req.session.userId = user._id;

    return res.status(200).json({
      message: 'Login Successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: error.message || 'Server Error!' });
  }
};

// Controllers for user logout
export const logoutUser = async (req: Request, res: Response) => {
  req.session.destroy((error: any) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ message: error.message });
    }
  });
  return res.status(200).json({ message: 'Logout Successfully' });
};

// Controller for user verify
export const verifyUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.session;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(400).json({ message: 'Invalid User' });
    }

    return res.json({ user });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: error.message || 'Server Error!' });
  }
};
