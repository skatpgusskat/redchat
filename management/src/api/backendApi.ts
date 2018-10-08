const BACKEND_ENDPOINT = 'http://localhost:3000';

export async function check2xx(response: Response) {
  if (response.status >= 200 || response.status < 300) {
    return;
  } else {
    const json = await response.json();
    throw new Error(json);
  }
}

interface PreSignedUrlResponse {
  url: string;
  fields: { [key: string]: string };
  mediaId: string;
  key: string;
}

async function getPreSignedUrl(token: string): Promise<PreSignedUrlResponse> {
  const response = await fetch(`${BACKEND_ENDPOINT}/media/preSignedUrl`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  await check2xx(response);
  return response.json();
}


interface UploadMediaResponse {
  url: string;
  mediaId: string;
  key: string;
}

async function uploadMedia(token: string, file: File): Promise<UploadMediaResponse> {
  const {
    url,
    fields,
    mediaId,
    key: s3Key,
  } = await getPreSignedUrl(token);

  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    formData.set(key, value);
  });
  formData.set('key', s3Key);
  formData.set('file', file);

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  await check2xx(response);
  return {
    url,
    mediaId,
    key: s3Key,
  };
}

export async function requestEmoticonRegisteration(
  token: string,
  channel: string,
  emoticonCommand: string,
  file: File,
) {
  const {
    mediaId,
  } = await uploadMedia(token, file);

  const response = await fetch(`${BACKEND_ENDPOINT}/channel/${channel}/emoticon`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      mediaId,
      command: emoticonCommand,
    }),
  });

  await check2xx(response);
}
