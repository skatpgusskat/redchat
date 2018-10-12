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
  private liveId?: string;

  constructor(private channelId: string) {
    super();
    this.startPolling();
  }

  public destory() {
    if (this.pollingTimer) {
      clearTimeout(this.pollingTimer);
    }
  }

  private async updateLiveId(): Promise<void> {
    const url = 'https://www.googleapis.com/youtube/v3/search' +
      '?eventType=live' +
      '&part=id' +
      `&channelId=${this.channelId}` +
      '&type=video' +
      `&key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    const liveId = data.items[0].id.videoId;
    this.liveId = liveId;
  }

  private async updateChatId(): Promise<void> {
    if (!this.liveId) {
      await this.updateLiveId();
    }
    const url = 'https://www.googleapis.com/youtube/v3/videos' +
      '?part=liveStreamingDetails' +
      `&id=${this.liveId}` +
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
    const lastLiveId = localStorage.getItem('lastLiveId');
    const lastChatId = localStorage.getItem('lastChatId');
    const lastPageToken = localStorage.getItem('lastPageToken') as string;

    await this.updateLiveId();
    await this.updateChatId();
    const { liveId, chatId } = this;

    if (lastLiveId === liveId && lastChatId === chatId) {
      return this.poll(lastPageToken);
    }

    localStorage.setItem('lastLiveId', liveId as string);
    localStorage.setItem('lastChatId', chatId as string);

    return this.poll();
  }

  private async poll(pageToken?: string) {
    const messageList = await this.getMessageList(pageToken);
    const { pollingIntervalMillis, nextPageToken } = messageList;

    messageList.items.forEach((item) => {
      this.pushChat({
        id: item.id,
        username: item.authorDetails.displayName,
        content: item.snippet.displayMessage,
      });
    });

    localStorage.setItem('lastPageToken', nextPageToken);

    this.pollingTimer = setTimeout(() => {
      this.poll(nextPageToken);
    }, pollingIntervalMillis);
  }
}
