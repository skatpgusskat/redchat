<template>
  <span>
    <span class="username" :style="{ color: chat.usernameColor }">{{ chat.username }}: </span>

    <template v-if="chat.imageUrl">
      <img class="content" :src="chat.imageUrl" />
    </template>
    <template v-else>
      <span class="content">{{ chat.content }}</span>
    </template>
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
