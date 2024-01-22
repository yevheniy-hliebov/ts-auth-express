import HttpException from "../exceptions/http.exception.js";
import { CreateUserDto } from "../types/user.type.js"

export function createdUserValidation(createUserDto: CreateUserDto) {
  const errors: Record<string, any> = {};

  if (typeof createUserDto.username !== 'string' || createUserDto.username.length < 3 || createUserDto.username.length > 40) {
    errors.username = 'Username must be a string between 3 and 40 characters.';
  }
  
  if (!validateEmail(createUserDto.email)) {
    errors.email = 'Email must be valid.';
  }

  if (typeof createUserDto.email !== 'string' || createUserDto.email.length < 3 || createUserDto.email.length > 255) {
    errors.email = 'Email must be a string between 3 and 255 characters.';
  }
  

  if (typeof createUserDto.password !== 'string' || createUserDto.password.length < 6 || createUserDto.password.length > 255) {
    errors.password = 'Password must be a string between 6 and 255 characters.';
  }
 
  if (Object.keys(errors).length > 0) {
    throw new HttpException('CreatingUser', 'Invalid user data', 422, errors);
  }
  return true;
}

function validateEmail(email: string) {
  const emailRegex = /^[a-zA-Z0-9]+([-_.]?[a-zA-Z0-9]+)*[@]{1}[a-zA-Z0-9]+([-_]{1}[a-zA-Z0-9]+)*([.]{1}[a-zA-Z0-9]{2,})+$/;
  if (!emailRegex.test(email)) return false;
  
  const [prefix, domain] = email.split('@');
  if (prefix.length < 2 || prefix.length > 64) return false;
  if (domain.length > 255) return false;
  
  return true;
}