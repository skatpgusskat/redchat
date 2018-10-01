import { IChat } from '@/Chat';

export default class Connector {
  public onChat: ((chat: IChat) => any) | undefined;
  protected pushChat(chat: IChat) {
    if (!this.onChat) {
      return;
    }
    this.onChat(chat);
  }
}