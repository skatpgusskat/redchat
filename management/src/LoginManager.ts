export default class LoginManager {
  accessToken: string;
  idToken: string;

  get isLoggedIn(): boolean {
    return !!this.accessToken;
  }

  constructor() {
    this.fetchAccessTokenAndIdToken();
  }
  extractData(keyValueStrings: string[], key: string): string {
    const data = keyValueStrings.find((keyValueString) => keyValueString.indexOf(key) === 0);
    if (!data) {
      return '';
    }
    return data.substring(`${key}=`.length);
  }

  fetchAccessTokenAndIdToken() {
    if (window.location.hash.indexOf('access_token') < 0) {
      return;
    }
    const data = window.location.hash.replace('#', '').split('&');
    this.accessToken = this.extractData(data, 'access_token');
    this.idToken = this.extractData(data, 'id_token');
  }

  login() {
    console.log('hi');
    const {
      hostname,
      protocol,
      port,
    } = window.location;

    const redirectUri = `${protocol}//${hostname}${port ? `:${port}` : ''}`;
    const responseType = 'token+id_token';
    const scope = ['openid', 'user_read'].join(' ');
    const clientId = '879mdhe236ji9spo6o3ejn4h481let';
    const url = 'https://id.twitch.tv/oauth2/authorize?'
      + `client_id=${clientId}`
      + `&redirect_uri=${redirectUri}`
      + `&response_type=${responseType}`
      + `&scope=${scope}`;
    window.location.href = url;
  }
}
