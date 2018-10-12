<template>
  <div class="container">
    <ul>
      <li v-for="chat in chats" :key="chat.id">
        <ChatComponent :chat="chat" />
      </li>
    </ul>
  </div>
</template>

<script lang="ts" src="./HelloWorld.ts"></script>

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
