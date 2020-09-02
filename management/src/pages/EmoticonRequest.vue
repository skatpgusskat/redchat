<template>
  <div class="home">
    <h1>Emoticon Request Page</h1>
    <template v-if="loginManager.isLoggedIn">
      <input type="file" ref="fileInput" @change="onFileChanged">
      커맨드 : <input :model="command">
      <button @click="submit()">등록하기</button>
    </template>
    <template v-else>
      <button @click="loginManager.login()">트위치로 로그인하기</button>
    </template>
  </div>
</template>

<script lang="ts" src="./EmoticonRequest.ts"></script>
