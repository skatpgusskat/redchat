import { IChat } from '@/Chat';

export default class Processor {
  private usernameColorMap: { [username: string]: string } = {};
  public process(chat: IChat): IChat {
    if (!chat.usernameColor) {
      const usernameColor = this.generateUsernameColor(chat.username);
      chat.usernameColor = usernameColor;
    }
    return chat;
  }
  private generateUsernameColor(username: string): string {
    if (this.usernameColorMap[username]) {
      return this.usernameColorMap[username];
    }
    let color = '#';
    for (let i = 0; i < 6; i += 1) {
      color += Math.floor(Math.random() * 16).toString(16);
    }
    this.usernameColorMap[username] = color;
    return color;
  }
}
