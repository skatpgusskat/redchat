import Connector from '@/connector/Connector';

interface TwitchHeaders {
  badges?: string[];
  color?: string;
  displayName?: string;
  emotes?: string;
  flags?: string;
  id?: string;
  mod?: string;
  roomId?: string;
  subscriber?: string;
  tmiSentTs?: string;
  turbo?: string;
  userId?: string;
  userType?: string;
}

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
      console.log(data);
      const headersString = data.substring(0, indexOfPRIVMSG)
      const content = data.substring(data.indexOf(':', indexOfPRIVMSG) + 1);

      const twitchHeaders = this.parseHeaders(headersString);
      const { displayName, id } = twitchHeaders;
      if (!displayName) {
        throw new Error('cannot find display-name header');
      }
      if (!id) {
        throw new Error('cannot find id header');
      }
      this.pushChat({
        username: displayName,
        usernameColor: twitchHeaders.color,
        id,
        content,
      });
    };
  }
  public destory() {
    this.ws.close();
    super.destory();
  }
  private parseHeaders(headersString: string): TwitchHeaders {
    return headersString.split(';').reduce((prev, string) => {
      const firstEqualSignIndex = string.indexOf('=');
      if (firstEqualSignIndex === -1) {
        return prev;
      }
      let headerName = string.substring(0, firstEqualSignIndex)
        .split('-')
        .map((chunk, index) => {
          if (index === 0) {
            return chunk;
          }
          return `${chunk.charAt(0).toUpperCase()}${chunk.slice(1)}`;
        })
        .join('');
      const headerValue = string.substring(firstEqualSignIndex + 1);
      const isArray = headerName.startsWith('@');

      if (isArray) {
        headerName = headerName.substring(1);
        return {
          ...prev,
          [headerName]: headerValue.split(','),
        };
      } else {
        return {
          ...prev,
          [headerName]: headerValue,
        };
      }
    }, {});
  }
}
