// src/lib/storage.ts
import { User, Class } from '@/types';
import { dummyUsers, dummyClasses } from '@/data/users';

// Users
export const getUsers = (): User[] => {
  const stored = localStorage.getItem('users');
  if (stored) {
    try {
      const users = JSON.parse(stored) as User[];
      return users;
    } catch (error) {
      console.error('Failed to parse users from localStorage', error);
      return dummyUsers;
    }
  }
  return dummyUsers;
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem('users', JSON.stringify(users));
};

// Classes
export const getClasses = (): Class[] => {
  const stored = localStorage.getItem('classes');
  if (stored) {
    try {
      const classes = JSON.parse(stored) as Class[];
      return classes;
    } catch (error) {
      console.error('Failed to parse classes from localStorage', error);
      return dummyClasses;
    }
  }
  return dummyClasses;
};

export const saveClasses = (classes: Class[]) => {
  localStorage.setItem('classes', JSON.stringify(classes));
};