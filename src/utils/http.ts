export async function readJsonResponse<T>(response: Response): Promise<T> {
  let data: { statusMessage?: string } & T;
  try {
    data = await response.json();
  } catch {
    if (!response.ok) {
      throw new Error(`Request failed (HTTP ${response.status}). Check the Apps Script Web App deployment and access settings.`);
    }
    throw new Error('The server returned an invalid response.');
  }

  if (!response.ok) {
    throw new Error(data.statusMessage ?? `Request failed (HTTP ${response.status}).`);
  }
  return data;
}