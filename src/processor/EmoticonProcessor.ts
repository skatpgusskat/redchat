import { IChat } from '@/Chat';
import { IProcessor } from '@/processor/IProcessor';

interface IEmoticon {
  key: string;
  imageUrl: string;
}
export default class Processor implements IProcessor {
  private emoticons: IEmoticon[] = [{
    key: '~우리핵아닌데',
    imageUrl: 'https://s3.ap-northeast-2.amazonaws.com/redchat-emoticon/%EC%9A%B0%EB%A6%AC%ED%95%B5%EC%95%84%EB%8B%8C%EB%8D%B0.gif',
  }];
  public process(chat: IChat): IChat {
    const emoticon = this.emoticons.find((item) => chat.content.startsWith(item.key))
    if (!emoticon) {
      return chat;
    }
    chat.imageUrl = emoticon.imageUrl;
    return chat;
  }
}
