import Connector from '@/connector/Connector';

export default class TwitchConnector extends Connector {
  private ws = new WebSocket('ws://irc-ws.chat.twitch.tv');

  constructor(channel: string) {
    super();

    this.ws.onopen = () => {
      this.ws.send('CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership');
      this.ws.send('PASS kappa');
      this.ws.send('NICK justinfan13113');
      this.ws.send(`JOIN #${channel}`);
    };

    this.ws.onmessage = (event) => {
      const data: string = event.data;
      if (data.lastIndexOf('PING', 0) === 0) {
        this.ws.send('PONG :tmi.twitch.tv');
        console.log('PONG Sent\r\n');
        return;
      }

      const indexOfPRIVMSG = data.indexOf('PRIVMSG');
      if (indexOfPRIVMSG < 0) {
        return;
      }
      const headers = data.substring(0, indexOfPRIVMSG).split(';');
      const content = data.substring(data.indexOf(':', indexOfPRIVMSG) + 1);

      const displayNameHeader = headers.find(header => header.indexOf('display-name') === 0);
      if (!displayNameHeader) {
        throw new Error('cannot find display-name header');
      }

      const username = displayNameHeader.substring('display-name='.length);
      this.pushChat({
        username,
        content,
      });
    };
  }
}