<template>
  <div class="container">
    <ul>
      <li v-for="chat in chats" :key="chat.id">
        <ChatComponent :chat="chat" />
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import TwtichConnector from '@/connector/TwitchConnector';
import EmoticonProcessor from '@/processor/EmoticonProcessor';
import UsernameColorProcessor from '@/processor/UsernameColorProcessor';
import { IChat } from '@/Chat';
import ChatComponent from '@/components/Chat.vue';
import { IProcessor } from '@/processor/IProcessor';

@Component({
  components: {
    ChatComponent,
  },
})
export default class HelloWorld extends Vue {
  @Prop() private msg!: string;

  private connector = new TwtichConnector('namse_');
  private processors: IProcessor[] = [
    new EmoticonProcessor(),
    new UsernameColorProcessor(),
  ];
  private chats: IChat[] = [];
  private duration = 20000;

  public mounted() {
    this.connector.onChat = (chat: IChat) => {
      console.log('before', chat);
      const result = this.processors.reduce((prev, processor) => {
        return processor.process(prev);
      }, chat);
      console.log('after', result);

      this.chats.push(result);

      this.setDeleteTimer(chat);
    };
  }

  public beforeDestroy() {
    this.connector.destory();
  }

  private setDeleteTimer(chat: IChat) {
    setTimeout(() => {
      this.chats = this.chats.filter((element) => element !== chat);
    }, this.duration);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.container {
  height: 100%;
}
.container ul {
  margin: 0;
  padding: 0;
  list-style: none;
  vertical-align: bottom;
  display: inline-block;
  position: absolute;
  bottom: 0px;
}
</style>
