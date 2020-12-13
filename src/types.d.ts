export interface IChat {
  _id: string;
  clientId: string;
  operatorId: string;
  lastMessageId: string;
  lastMessage: Message;
  lastMessageDate: Date;
  clientUnreadMessages: number;
  operatorUnreadMessages: number;
  client: IUser;
  operator: IUser;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage {
  _id: string;
  text: string;
  type: 'text' | 'photo' | 'call';
  isRead: boolean;
  authorRole: 'admin' | 'operator' | 'client';
  photosIds: string[];
  photos: IUpload[];
  chatId: string;
  userId: string;
  user: IUser;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUpload {
  _id: string;
  originalname: string;
  filename: string;
  mimetype?: string;
  path?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser {
  _id: string;
  email: string;
  password?: string;
  role: 'admin' | 'operator' | 'client';
  firstName: string;
  lastName: string;
  isOnline: boolean;
  avatarId: string;
  avatar?: IUpload;
  createdAt: Date;
  updatedAt: Date;
}

export type ValidationErrorsObject<FormItem> = {
  [P in keyof FormItem]?: FormItem[P] extends object
    ? ValidationErrorsObject<FormItem[P]>
    : string;
};
