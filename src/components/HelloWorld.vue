<template>
  <div class="hello">
    <ul>
      <li v-for="chat in chats" :key="chat.content">
        <ChatComponent :chat="chat" />
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import TwtichConnector from '@/connector/TwitchConnector';
import Processor from '@/processor/Processor';
import { IChat } from '@/Chat';
import ChatComponent from '@/components/Chat.vue';

@Component({
  components: {
    ChatComponent,
  },
})
export default class HelloWorld extends Vue {
  @Prop() private msg!: string;

  private connector = new TwtichConnector('namse_');
  private processor = new Processor();
  private chats: IChat[] = [];

  public mounted() {
    this.connector.onChat = (chat: IChat) => {
      const result = this.processor.process(chat);
      this.chats.push(result);
    };
  }

  public beforeDestroy() {
    this.connector.destory();
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
