import { IChat } from '@/Chat';

export interface IProcessor {
  process(chat: IChat): IChat;
}
