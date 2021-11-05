const { ObjectId } = require('mongodb');
const connection = require('./connection');

const coll = 'users';

const createUser = async (name, password, email, role) => {
  const newUser = await connection()
    .then((db) => db.collection(coll)
      .insertOne({
        name, password, email, role, userId: new ObjectId(),
      }))
    .then((result) => {
      const { password: _, ...userWithoutPassword } = result.ops[0];
      const { _id } = userWithoutPassword;
      return { name, email, id: _id };
    });

  return newUser;
};

const existingEmail = async (email) => {
  const exists = await connection()
    .then((db) => db.collection(coll).findOne({ email }));

  return exists;
};

const checkLogin = async (email, password) => {
  const checkingUser = await connection()
    .then((db) => db.collection(coll).findOne({ email, password }));

  if (!checkingUser) return null;

  const { password: _, ...userWithoutPassword } = checkingUser;
  const { name, _id } = userWithoutPassword;
  return { name, email, id: _id };
};

const findAllUsers = async () => {
  const allUsers = await connection()
    .then((db) => db.collection(coll).find().toArray());

  return allUsers.map((user) => {
    const { password: _, ...userWithoutPassword } = user;
    const { name, email, _id } = userWithoutPassword;
    return { name, email, id: _id };
  });
};

const createAdmin = async (name, password, email, role) => {
  const existingUser = await existingEmail(email);

  if (existingUser) return updateUser(name, password, email, role);

  return createUser(name, password, email, role);
};

module.exports = {
  createUser,
  existingEmail,
  checkLogin,
  findAllUsers,
  createAdmin,
};
