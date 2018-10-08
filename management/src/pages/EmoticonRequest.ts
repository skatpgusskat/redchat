import { Component, Vue } from 'vue-property-decorator';

@Component
export default class EmoticonRequestPage extends Vue {
  $refs!: {
    fileInput: HTMLInputElement;
  };

  file: File;

  text = 'abc';

  onFileChanged() {
    const files = this.$refs.fileInput.files;
    if (!files || !files[0]) {
      return;
    }
    this.file = files[0];;
  }
  summit() {

  }
}