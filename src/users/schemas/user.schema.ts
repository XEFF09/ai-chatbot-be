import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export const UserRole = {
  ADMIN: 'admin',
  USER: 'user',
};

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  username: string;

  @Prop({ minLength: 6 })
  password: string;

  @Prop({ enum: [UserRole.ADMIN, UserRole.USER], default: UserRole.USER })
  role: string;

  @Prop()
  googleId: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
