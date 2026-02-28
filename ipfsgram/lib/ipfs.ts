import { Post, FeedIndex } from './types';

function apiBase(apiUrl: string): string {
  return apiUrl.replace(/\/$/, '');
}

function gatewayBase(apiUrl: string): string {
  // Derive gateway URL from API URL by swapping port 5001 → 8080
  return apiUrl.replace(':5001', ':8080');
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms),
    ),
  ]);
}

export async function uploadJson(apiUrl: string, data: object): Promise<string> {
  const jsonStr = JSON.stringify(data);
  // Build multipart form body manually since Blob isn't available in React Native
  const boundary = `----IPFSGram${Date.now()}`;
  const body =
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="data.json"\r\n` +
    `Content-Type: application/json\r\n\r\n` +
    `${jsonStr}\r\n` +
    `--${boundary}--\r\n`;

  const res = await withTimeout(
    fetch(`${apiBase(apiUrl)}/api/v0/add`, {
      method: 'POST',
      headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
      body,
    }),
    30000,
    'Upload',
  );

  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  const json = await res.json();
  return json.Hash as string;
}

export async function generateKey(
  apiUrl: string,
  keyName: string,
): Promise<{ Name: string; Id: string }> {
  const res = await withTimeout(
    fetch(
      `${apiBase(apiUrl)}/api/v0/key/gen?arg=${encodeURIComponent(keyName)}&type=ed25519`,
      { method: 'POST' },
    ),
    15000,
    'Key gen',
  );
  if (!res.ok) throw new Error(`Key gen failed: ${res.status}`);
  return res.json();
}

export async function listKeys(
  apiUrl: string,
): Promise<{ Keys: { Name: string; Id: string }[] }> {
  const res = await withTimeout(
    fetch(`${apiBase(apiUrl)}/api/v0/key/list`, { method: 'POST' }),
    10000,
    'Key list',
  );
  if (!res.ok) throw new Error(`Key list failed: ${res.status}`);
  return res.json();
}

export async function publishToIpns(
  apiUrl: string,
  cid: string,
  keyName: string,
): Promise<{ Name: string; Value: string }> {
  const res = await withTimeout(
    fetch(
      `${apiBase(apiUrl)}/api/v0/name/publish?arg=/ipfs/${cid}&key=${encodeURIComponent(keyName)}`,
      { method: 'POST' },
    ),
    60000,
    'IPNS publish',
  );
  if (!res.ok) throw new Error(`IPNS publish failed: ${res.status}`);
  return res.json();
}

export async function resolveIpns(
  apiUrl: string,
  ipnsKeyId: string,
): Promise<string> {
  const res = await withTimeout(
    fetch(
      `${apiBase(apiUrl)}/api/v0/name/resolve?arg=${encodeURIComponent(ipnsKeyId)}`,
      { method: 'POST' },
    ),
    30000,
    'IPNS resolve',
  );
  if (!res.ok) throw new Error(`IPNS resolve failed: ${res.status}`);
  const json = await res.json();
  // Path is like /ipfs/Qm...
  return json.Path.replace('/ipfs/', '');
}

export async function fetchFromGateway<T>(apiUrl: string, cid: string): Promise<T> {
  const gw = gatewayBase(apiUrl);
  const res = await withTimeout(
    fetch(`${gw}/ipfs/${cid}`),
    15000,
    'Gateway fetch',
  );
  if (!res.ok) throw new Error(`Gateway fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchPost(apiUrl: string, cid: string): Promise<Post> {
  return fetchFromGateway<Post>(apiUrl, cid);
}

export async function fetchFeedIndex(apiUrl: string, cid: string): Promise<FeedIndex> {
  return fetchFromGateway<FeedIndex>(apiUrl, cid);
}
