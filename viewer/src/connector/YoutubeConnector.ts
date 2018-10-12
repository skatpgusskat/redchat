import Connector from '@/connector/Connector';

const API_KEY = 'AIzaSyDRsN_9nC8Hh8HQYJamfP712qttIIp3qLw'; // I know it has security problem. but I already whitelist IP.

interface YoutubeLiveChatMessage {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    type: string;
    liveChatId: string;
    authorChannelId: string;
    publishedAt: Date;
    hasDisplayContent: boolean;
    displayMessage: string;
    fanFundingEventDetails: {
      amountMicros: number;
      currency: string;
      amountDisplayString: string;
      userComment: string;
    };
    textMessageDetails: {
      messageText: string;
    };
    messageDeletedDetails: {
      deletedMessageId: string;
    };
    userBannedDetails: {
      bannedUserDetails: {
        channelId: string;
        channelUrl: string;
        displayName: string;
        profileImageUrl: string
      };
      banType: string;
      banDurationSeconds: number;
    };
    superChatDetails: {
      amountMicros: number;
      currency: string;
      amountDisplayString: string;
      userComment: string;
      tier: number;
    }
  };
  authorDetails: {
    channelId: string;
    channelUrl: string;
    displayName: string;
    profileImageUrl: string;
    isVerified: boolean;
    isChatOwner: boolean;
    isChatSponsor: boolean;
    isChatModerator: boolean;
  };
}

interface YoutubeLiveChatMessageListResponse {
  kind: string;
  etag: string;
  nextPageToken: string;
  pollingIntervalMillis: number;
  offlineAt: Date;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: YoutubeLiveChatMessage[];
}

export default class YouTubeConnector extends Connector {
  private chatId?: string;
  private pollingTimer?: number;

  constructor(private channelId: string) {
    super();
    this.startPolling();
  }

  public destory() {
    if (this.pollingTimer) {
      clearTimeout(this.pollingTimer);
    }
  }

  private async getLiveId(): Promise<string> {
    const url = 'https://www.googleapis.com/youtube/v3/search' +
      '?eventType=live' +
      '&part=id' +
      `&channelId=${this.channelId}` +
      '&type=video' +
      `&key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    const liveId = data.items[0].id.videoId;
    return liveId;
  }

  private async updateChatId(): Promise<void> {
    const liveId = await this.getLiveId();
    const url = 'https://www.googleapis.com/youtube/v3/videos' +
      '?part=liveStreamingDetails' +
      `&id=${liveId}` +
      `&key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    if (!data.items.length) {
      throw new Error('Can not find chat.');
    }
    const chatId = data.items[0].liveStreamingDetails.activeLiveChatId;
    this.chatId = chatId;
  }

  private async getMessageList(pageToken?: string): Promise<YoutubeLiveChatMessageListResponse> {
    if (!this.chatId) {
      await this.updateChatId();
    }
    const url = 'https://www.googleapis.com/youtube/v3/liveChat/messages' +
      `?liveChatId=${this.chatId}` +
      '&part=id,snippet,authorDetails' +
      '&maxResults=2000' +
      `&key=${API_KEY}` +
      `${pageToken ? `&pageToken=${pageToken}` : ''}`;
    const response = await fetch(url);
    const data = await response.json() as YoutubeLiveChatMessageListResponse;
    return data;
  }

  private async startPolling() {
    this.poll();
  }

  private async poll(pageToken?: string) {
    const messageList = await this.getMessageList(pageToken);
    const { pollingIntervalMillis } = messageList;

    messageList.items.forEach((item) => {
      this.pushChat({
        id: item.id,
        username: item.authorDetails.displayName,
        content: item.snippet.displayMessage,
      });
    });

    this.pollingTimer = setTimeout(() => {
      this.poll(messageList.nextPageToken);
    }, pollingIntervalMillis);
  }
}
