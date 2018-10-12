import { Component, Prop, Vue } from 'vue-property-decorator';
import TwtichConnector from '@/connector/TwitchConnector';
import EmoticonProcessor from '@/processor/EmoticonProcessor';
import UsernameColorProcessor from '@/processor/UsernameColorProcessor';
import { IChat } from '@/Chat';
import ChatComponent from '@/components/Chat.vue';
import { IProcessor } from '@/processor/IProcessor';
import YouTubeConnector from '@/connector/YoutubeConnector';

@Component({
  components: {
    ChatComponent,
  },
})
export default class HelloWorld extends Vue {
  @Prop() private msg!: string;

  private connectors = [
    new TwtichConnector('namse_'),
    new YouTubeConnector('UCLQyQrwUpXasp7ejfQsjS0g'),
  ]
  private processors: IProcessor[] = [
    new EmoticonProcessor(),
    new UsernameColorProcessor(),
  ];
  private chats: IChat[] = [];
  private duration = 20000;

  public mounted() {
    this.connectors.forEach((connector) => {
      connector.onChat = (chat: IChat) => {
        console.log('before', chat);
        const result = this.processors.reduce((prev, processor) => {
          return processor.process(prev);
        }, chat);
        console.log('after', result);

        this.chats.push(result);

        this.setDeleteTimer(chat);
      };
    });
  }

  public beforeDestroy() {
    this.connectors.forEach((connector) => {
      connector.destory();
    });
  }

  private setDeleteTimer(chat: IChat) {
    setTimeout(() => {
      this.chats = this.chats.filter((element) => element !== chat);
    }, this.duration);
  }
}