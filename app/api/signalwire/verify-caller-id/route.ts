import { NextRequest, NextResponse } from 'next/server';
import { normalizeUsPhoneToE164 } from '@/utils/phone';

export const dynamic = 'force-dynamic';

class VerifiedCallerIdRequestError extends Error {
  status: number;
  basePath: string;
  responseBody: string;
  requestMethod: string;
  requestPath: string;
  requestBody: string | null;

  constructor({
    message,
    status,
    basePath,
    responseBody,
    requestMethod,
    requestPath,
    requestBody,
  }: {
    message: string;
    status: number;
    basePath: string;
    responseBody: string;
    requestMethod: string;
    requestPath: string;
    requestBody: string | null;
  }) {
    super(message);
    this.name = 'VerifiedCallerIdRequestError';
    this.status = status;
    this.basePath = basePath;
    this.responseBody = responseBody;
    this.requestMethod = requestMethod;
    this.requestPath = requestPath;
    this.requestBody = requestBody;
  }
}

const VERIFIED_CALLER_ID_PATHS = [
  '/verified_caller_ids',
  '/api/verified_caller_ids',
  '/api/relay/rest/verified_caller_ids',
];

const getSignalWireConfig = () => {
  const projectId =
    process.env.SIGNALWIRE_PROJECT_ID?.trim();
  const apiToken = (
    process.env.SIGNALWIRE_API_TOKEN ||
    process.env.SIGNALWIRE_TOKEN
  )?.trim();
  const spaceUrl = process.env.SIGNALWIRE_SPACE_URL
    ?.trim()
    .replace(/^https?:\/\//, '');

  if (!projectId || !apiToken || !spaceUrl) {
    return null;
  }

  const authHeader = Buffer.from(
    `${projectId}:${apiToken}`
  ).toString('base64');

  return { projectId, apiToken, spaceUrl, authHeader };
};

const getIncomingPhoneNumber = (phone: any): string | null => {
  const raw = String(
    phone?.phone_number || phone?.phoneNumber || ''
  );
  return normalizeUsPhoneToE164(raw);
};

const getVerifiedCallerIdPhone = (
  callerId: any
): string | null => {
  const raw = String(
    callerId?.number ||
      callerId?.phone_number ||
      callerId?.phoneNumber ||
      ''
  );
  return normalizeUsPhoneToE164(raw);
};

const isVerifiedCallerId = (callerId: any): boolean => {
  const status = String(
    callerId?.status || ''
  ).toLowerCase();

  return (
    Boolean(
      callerId?.verified ||
        callerId?.is_verified ||
        callerId?.validated ||
        callerId?.verified_at
    ) ||
    status === 'verified' ||
    status === 'active' ||
    status === 'complete'
  );
};

const parseVerifiedCallerIdList = (data: any) => {
  const list =
    data?.data ||
    data?.verified_caller_ids ||
    data?.verifiedCallerIds ||
    [];
  return Array.isArray(list) ? list : [];
};

const listIncomingPhoneNumbers = async (
  spaceUrl: string,
  projectId: string,
  authHeader: string
) => {
  const allPhoneNumbers: any[] = [];
  let nextUrl = `https://${spaceUrl}/api/laml/2010-04-01/Accounts/${projectId}/IncomingPhoneNumbers.json?PageSize=100`;

  while (nextUrl) {
    const response = await fetch(nextUrl, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${authHeader}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to list incoming phone numbers: ${errorText}`
      );
    }

    const data = await response.json();
    const list =
      data?.incoming_phone_numbers ||
      data?.data ||
      [];

    if (Array.isArray(list)) {
      allPhoneNumbers.push(...list);
    }

    const nextPageUri = String(
      data?.next_page_uri || ''
    ).trim();
    nextUrl = nextPageUri
      ? new URL(
          nextPageUri,
          `https://${spaceUrl}`
        ).toString()
      : '';
  }

  return allPhoneNumbers;
};

const requestVerifiedCallerIds = async (
  spaceUrl: string,
  authHeader: string,
  path: string,
  init: RequestInit
) => {
  let lastError: Error | null = null;
  const requestMethod = String(
    init.method || 'GET'
  ).toUpperCase();
  const requestBody =
    typeof init.body === 'string'
      ? init.body
      : init.body
        ? '[non-string body]'
        : null;

  for (const basePath of VERIFIED_CALLER_ID_PATHS) {
    const url = `https://${spaceUrl}${basePath}${path}`;
    try {
      const response = await fetch(url, {
        ...init,
        headers: {
          Authorization: `Basic ${authHeader}`,
          Accept: 'application/json',
          ...(init.headers || {}),
        },
      });

      if (response.status === 404) {
        lastError = new Error(
          `Verified Caller IDs endpoint not found at ${basePath}${path}`
        );
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new VerifiedCallerIdRequestError({
          message:
            `Verified Caller IDs ${requestMethod} failed at ${basePath}${path}`,
          status: response.status,
          basePath,
          responseBody:
            errorText || `Request failed with status ${response.status}`,
          requestMethod,
          requestPath: `${basePath}${path}`,
          requestBody,
        });
      }

      const contentType = String(
        response.headers.get('content-type') || ''
      ).toLowerCase();
      const bodyText = await response.text();
      const trimmedBody = bodyText.trim();

      if (
        !contentType.includes('application/json') &&
        trimmedBody.startsWith('<!doctype')
      ) {
        lastError = new Error(
          `Verified Caller IDs endpoint returned HTML at ${basePath}${path}`
        );
        continue;
      }

      try {
        const data = trimmedBody
          ? JSON.parse(trimmedBody)
          : {};

        return {
          data,
          basePath,
        };
      } catch {
        lastError = new VerifiedCallerIdRequestError({
          message: `Verified Caller IDs endpoint returned non-JSON data at ${basePath}${path}`,
          status: response.status,
          basePath,
          responseBody: trimmedBody.slice(0, 1000),
          requestMethod,
          requestPath: `${basePath}${path}`,
          requestBody,
        });
        continue;
      }
    } catch (error) {
      lastError =
        error instanceof Error
          ? error
          : new Error('Unknown SignalWire request error');
    }
  }

  throw (
    lastError ||
    new Error('Verified Caller IDs endpoint not available')
  );
};

const listVerifiedCallerIds = async (
  spaceUrl: string,
  authHeader: string
) => {
  const result = await requestVerifiedCallerIds(
    spaceUrl,
    authHeader,
    '',
    {
      method: 'GET',
    }
  );
  return parseVerifiedCallerIdList(result.data);
};

const getVerifiedCallerIdById = async (
  id: string,
  spaceUrl: string,
  authHeader: string
) => {
  const result = await requestVerifiedCallerIds(
    spaceUrl,
    authHeader,
    `/${id}`,
    {
      method: 'GET',
    }
  );
  return result.data;
};

const createVerifiedCallerId = async (
  phoneNumber: string,
  friendlyName: string,
  spaceUrl: string,
  authHeader: string
) => {
  const result = await requestVerifiedCallerIds(
    spaceUrl,
    authHeader,
    '',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        number: phoneNumber,
        name: friendlyName,
        friendly_name: friendlyName,
      }),
    }
  );
  return result.data;
};

const redialVerifiedCallerId = async (
  id: string,
  spaceUrl: string,
  authHeader: string
) => {
  const result = await requestVerifiedCallerIds(
    spaceUrl,
    authHeader,
    `/${id}/verification`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    }
  );
  return result.data;
};

const submitVerifiedCallerIdCode = async (
  id: string,
  code: string,
  spaceUrl: string,
  authHeader: string
) => {
  const result = await requestVerifiedCallerIds(
    spaceUrl,
    authHeader,
    `/${id}/verification`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        verification_code: code,
        code,
        token: code,
      }),
    }
  );
  return result.data;
};

export async function GET(request: NextRequest) {
  try {
    const listAll =
      request.nextUrl.searchParams.get('list') === '1';
    const normalizedPhone = normalizeUsPhoneToE164(
      String(
        request.nextUrl.searchParams.get('phoneNumber') ||
          ''
      )
    );
    const callerIdId = String(
      request.nextUrl.searchParams.get('callerIdId') ||
        ''
    ).trim();

    const config = getSignalWireConfig();
    if (!config) {
      return NextResponse.json(
        { error: 'SignalWire credentials not configured' },
        { status: 500 }
      );
    }

    const { projectId, spaceUrl, authHeader } = config;

    if (listAll) {
      let incomingPhoneNumbers: any[] = [];
      let verifiedCallerIds: any[] = [];
      let incomingError: string | null = null;
      let verifiedError: string | null = null;

      try {
        incomingPhoneNumbers = await listIncomingPhoneNumbers(
          spaceUrl,
          projectId,
          authHeader
        );
      } catch (error) {
        incomingError =
          error instanceof Error
            ? error.message
            : 'Failed to list incoming phone numbers';
      }

      try {
        verifiedCallerIds = await listVerifiedCallerIds(
          spaceUrl,
          authHeader
        );
      } catch (error) {
        verifiedError =
          error instanceof Error
            ? error.message
            : 'Failed to list verified caller IDs';
      }

      return NextResponse.json({
        incomingPhoneNumbers: incomingPhoneNumbers.map(
          (phone: any) => ({
            id: phone?.sid || phone?.id || null,
            phoneNumber:
              getIncomingPhoneNumber(phone),
            rawStatus: phone?.status || null,
            source: 'incoming',
          })
        ),
        verifiedCallerIds: verifiedCallerIds.map(
          (callerId: any) => ({
            id:
              callerId?.id ||
              callerId?.sid ||
              null,
            phoneNumber:
              getVerifiedCallerIdPhone(callerId),
            rawStatus:
              callerId?.status || null,
            verified:
              isVerifiedCallerId(callerId),
            source: 'verified-caller-id',
            raw: callerId,
          })
        ),
        errors: {
          incomingPhoneNumbers: incomingError,
          verifiedCallerIds: verifiedError,
        },
      });
    }

    if (!normalizedPhone) {
      return NextResponse.json(
        { error: 'Invalid US phone number' },
        { status: 400 }
      );
    }

    const incomingPhoneNumbers = await listIncomingPhoneNumbers(
      spaceUrl,
      projectId,
      authHeader
    ).catch(() => []);
    const ownedPhoneMatch = incomingPhoneNumbers.find(
      (phone: any) =>
        getIncomingPhoneNumber(phone) === normalizedPhone
    );

    if (ownedPhoneMatch) {
      return NextResponse.json({
        exists: true,
        verified: true,
        phoneNumber: normalizedPhone,
        id:
          ownedPhoneMatch.sid ||
          ownedPhoneMatch.id ||
          null,
        status: 'owned',
        raw: ownedPhoneMatch,
      });
    }

    let existingMatch: any = null;

    if (callerIdId) {
      try {
        const callerId = await getVerifiedCallerIdById(
          callerIdId,
          spaceUrl,
          authHeader
        );
        if (
          getVerifiedCallerIdPhone(callerId) ===
          normalizedPhone
        ) {
          existingMatch = callerId;
        }
      } catch {
        // Fall through to list lookup.
      }
    }

    if (!existingMatch) {
      const verifiedCallerIds = await listVerifiedCallerIds(
        spaceUrl,
        authHeader
      );
      existingMatch = verifiedCallerIds.find(
        (callerId: any) =>
          getVerifiedCallerIdPhone(callerId) ===
          normalizedPhone
      );
    }

    if (!existingMatch) {
      return NextResponse.json({
        exists: false,
        verified: false,
        phoneNumber: normalizedPhone,
        status: 'unverified',
      });
    }

    const verified = isVerifiedCallerId(existingMatch);

    return NextResponse.json({
      exists: true,
      verified,
      phoneNumber: normalizedPhone,
      id:
        existingMatch.id ||
        existingMatch.sid ||
        null,
      status: verified
        ? 'verified'
        : String(
            existingMatch.status || 'pending'
          ).toLowerCase(),
      raw: existingMatch,
    });
  } catch (error) {
    console.error(
      'Verify caller-id status API error:',
      error
    );
    const details =
      error instanceof VerifiedCallerIdRequestError
        ? {
            status: error.status,
            basePath: error.basePath,
            responseBody: error.responseBody,
            requestMethod: error.requestMethod,
            requestPath: error.requestPath,
            requestBody: error.requestBody,
          }
        : undefined;
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Internal server error',
        details,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, friendlyName } = await request.json();
    const normalizedPhone = normalizeUsPhoneToE164(
      String(phoneNumber || '')
    );

    if (!normalizedPhone) {
      return NextResponse.json(
        { error: 'Invalid US phone number' },
        { status: 400 }
      );
    }

    const config = getSignalWireConfig();
    if (!config) {
      return NextResponse.json(
        { error: 'SignalWire credentials not configured' },
        { status: 500 }
      );
    }

    const { projectId, spaceUrl, authHeader } = config;

    const incomingPhoneNumbers = await listIncomingPhoneNumbers(
      spaceUrl,
      projectId,
      authHeader
    ).catch(() => []);
    const ownedPhoneMatch = incomingPhoneNumbers.find(
      (phone: any) =>
        getIncomingPhoneNumber(phone) === normalizedPhone
    );

    if (ownedPhoneMatch) {
      return NextResponse.json({
        id:
          ownedPhoneMatch.sid ||
          ownedPhoneMatch.id ||
          null,
        phoneNumber: normalizedPhone,
        status: 'owned',
        alreadyVerified: true,
        raw: ownedPhoneMatch,
      });
    }

    const verifiedCallerIds = await listVerifiedCallerIds(
      spaceUrl,
      authHeader
    ).catch(() => []);
    const existingMatch = verifiedCallerIds.find(
      (callerId: any) =>
        getVerifiedCallerIdPhone(callerId) ===
        normalizedPhone
    );

    if (existingMatch && isVerifiedCallerId(existingMatch)) {
      return NextResponse.json({
        id:
          existingMatch.id ||
          existingMatch.sid ||
          null,
        phoneNumber: normalizedPhone,
        status: 'verified',
        alreadyVerified: true,
        raw: existingMatch,
      });
    }

    if (existingMatch) {
      const redialData = await redialVerifiedCallerId(
        String(
          existingMatch.id || existingMatch.sid || ''
        ),
        spaceUrl,
        authHeader
      );

      return NextResponse.json({
        id:
          existingMatch.id ||
          existingMatch.sid ||
          null,
        phoneNumber: normalizedPhone,
        status: 'pending',
        alreadyVerified: false,
        reusedExisting: true,
        raw: redialData,
      });
    }

    const created = await createVerifiedCallerId(
      normalizedPhone,
      String(friendlyName || 'Painter Caller ID'),
      spaceUrl,
      authHeader
    );

    return NextResponse.json({
      id: created?.id || created?.sid || null,
      phoneNumber:
        getVerifiedCallerIdPhone(created) ||
        normalizedPhone,
      status: String(created?.status || 'pending').toLowerCase(),
      alreadyVerified: false,
      reusedExisting: false,
      raw: created,
    });
  } catch (error) {
    console.error('Verify caller-id API error:', error);
    const details =
      error instanceof VerifiedCallerIdRequestError
        ? {
            status: error.status,
            basePath: error.basePath,
            responseBody: error.responseBody,
            requestMethod: error.requestMethod,
            requestPath: error.requestPath,
            requestBody: error.requestBody,
          }
        : undefined;
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Internal server error',
        details,
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const {
      id,
      phoneNumber,
      verificationCode,
      code,
    } = await request.json();
    const resolvedCode = String(
      verificationCode || code || ''
    )
      .trim()
      .replace(/\D/g, '');

    if (resolvedCode.length !== 6) {
      return NextResponse.json(
        { error: 'Enter a valid 6 digit code' },
        { status: 400 }
      );
    }

    const config = getSignalWireConfig();
    if (!config) {
      return NextResponse.json(
        { error: 'SignalWire credentials not configured' },
        { status: 500 }
      );
    }

    const { spaceUrl, authHeader } = config;
    let resolvedId = String(id || '').trim();

    if (!resolvedId) {
      const normalizedPhone = normalizeUsPhoneToE164(
        String(phoneNumber || '')
      );

      if (!normalizedPhone) {
        return NextResponse.json(
          { error: 'Verification ID or phone number is required' },
          { status: 400 }
        );
      }

      const verifiedCallerIds = await listVerifiedCallerIds(
        spaceUrl,
        authHeader
      );
      const existingMatch = verifiedCallerIds.find(
        (callerId: any) =>
          getVerifiedCallerIdPhone(callerId) ===
          normalizedPhone
      );
      resolvedId = String(
        existingMatch?.id || existingMatch?.sid || ''
      ).trim();

      if (!resolvedId) {
        return NextResponse.json(
          { error: 'No verification request found for this number' },
          { status: 404 }
        );
      }
    }

    const verified = await submitVerifiedCallerIdCode(
      resolvedId,
      resolvedCode,
      spaceUrl,
      authHeader
    );

    return NextResponse.json({
      id: verified?.id || verified?.sid || resolvedId,
      phoneNumber:
        getVerifiedCallerIdPhone(verified),
      status: String(verified?.status || 'verified').toLowerCase(),
      verified: isVerifiedCallerId(verified) || true,
      raw: verified,
    });
  } catch (error) {
    console.error(
      'Validate caller-id API error:',
      error
    );
    const details =
      error instanceof VerifiedCallerIdRequestError
        ? {
            status: error.status,
            basePath: error.basePath,
            responseBody: error.responseBody,
            requestMethod: error.requestMethod,
            requestPath: error.requestPath,
            requestBody: error.requestBody,
          }
        : undefined;
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Internal server error',
        details,
      },
      { status: 500 }
    );
  }
}
