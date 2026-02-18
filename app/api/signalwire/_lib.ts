export interface SignalWireConfig {
  projectId: string;
  apiToken: string;
  spaceUrl: string;
  authHeader: string;
}

export const getSignalWireConfig = (): SignalWireConfig | null => {
  const projectId = process.env.SIGNALWIRE_PROJECT_ID?.trim();
  const apiToken = (process.env.SIGNALWIRE_API_TOKEN || process.env.SIGNALWIRE_TOKEN)?.trim();
  const spaceUrl = process.env.SIGNALWIRE_SPACE_URL?.trim().replace(/^https?:\/\//, '');

  if (!projectId || !apiToken || !spaceUrl) {
    return null;
  }

  const authHeader = Buffer.from(`${projectId}:${apiToken}`).toString('base64');
  return { projectId, apiToken, spaceUrl, authHeader };
};

const parseConferenceList = (payload: any): any[] => {
  const list = payload?.data ?? payload;
  return Array.isArray(list) ? list : [];
};

export const listConferences = async (config: SignalWireConfig): Promise<any[]> => {
  const response = await fetch(`https://${config.spaceUrl}/api/video/conferences`, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      Authorization: `Basic ${config.authHeader}`,
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to list conferences: ${errorText}`);
  }

  const payload = await response.json();
  return parseConferenceList(payload);
};

export const getConferenceById = async (
  config: SignalWireConfig,
  conferenceId: string
): Promise<any | null> => {
  const response = await fetch(`https://${config.spaceUrl}/api/video/conferences/${conferenceId}`, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      Authorization: `Basic ${config.authHeader}`,
      Accept: 'application/json'
    }
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch conference by id: ${errorText}`);
  }

  const payload = await response.json();
  return payload?.data ?? payload ?? null;
};

export const resolveConference = async (
  config: SignalWireConfig,
  opts: { conferenceId?: string | null; roomName?: string | null }
): Promise<any | null> => {
  const conferenceId = opts.conferenceId?.trim();
  if (conferenceId) {
    return getConferenceById(config, conferenceId);
  }

  const roomName = opts.roomName?.trim();
  if (!roomName) return null;

  const conferences = await listConferences(config);
  return conferences.find((conference: any) => conference?.name === roomName) || null;
};
