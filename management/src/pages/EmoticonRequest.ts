import { Component, Vue } from 'vue-property-decorator';
import { requestEmoticonRegisteration } from '@/api/backendApi';
import LoginManager from '@/LoginManager';

@Component
export default class EmoticonRequestPage extends Vue {
  $refs!: {
    fileInput: HTMLInputElement;
  };
  file: File;
  command: string = '';
  loginManager = new LoginManager();

  onFileChanged() {
    const files = this.$refs.fileInput.files;
    if (!files || !files[0]) {
      return;
    }
    this.file = files[0];
  }
  async submit() {
    await requestEmoticonRegisteration(this.loginManager.accessToken, 'namse_', this.command, this.file);
    alert('등록되었다니깐요?');
  }
  login() {
    console.log('hi');
    this.loginManager.login();
  }
}
