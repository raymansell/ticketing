import { Document, Schema, model } from 'mongoose';
import { PasswordManager } from '../services/password-manager.js';

interface UserAttrs {
  email: string;
  password: string;
}

export interface UserDoc extends Document, UserAttrs {}

const userSchema = new Schema<UserDoc>(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
  },
  {
    toJSON: {
      transform(doc, ret) {
        const { _id, email } = ret;
        return { id: _id, email };
      },
    },
  }
);

// middleware in mongoose
userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    const hashed = await PasswordManager.toHash(this.get('password'));
    this.set('password', hashed);
  }
});

const UserModel = model<UserDoc>('User', userSchema);

class User extends UserModel {
  constructor(attrs: UserAttrs) {
    super(attrs);
  }
}

export { User };
