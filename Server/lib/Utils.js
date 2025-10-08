//here we write a function to generate the tokens for authentication
import jwt from "jsonwebtoken";

export const generateToken = (userId) => {
  const token =  jwt.sign({ userId}, process.env.JWT_SECRET) ;
  return token;
}