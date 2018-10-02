<template>
  <span>
    <span class="username" :style="{ color: chat.usernameColor }">{{ chat.username }}: </span>
    <span class="content">{{ chat.content }}</span>
  </span>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';
  import { IChat } from '@/Chat';

  @Component
  export default class ChatComponent extends Vue {
    @Prop() public chat!: IChat;
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.username {
  color: white;
}

.content {
  color: white;
}
</style>
