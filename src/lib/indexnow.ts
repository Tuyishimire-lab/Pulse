const INDEXNOW_API_URL = 'https://api.indexnow.org/indexnow';
const DEFAULT_HOST = 'www.pulstraffic.com';
const DEFAULT_KEY = '14eac490de1941d88e198247a1246901';

export interface IndexNowResponse {
  success: boolean;
  status: number;
  message: string;
  submittedCount: number;
}

/**
 * Submit a batch of URLs to IndexNow for immediate search engine indexing.
 * Supported by Microsoft Bing, Yandex, Naver, Seznam, and other participating engines.
 */
export async function submitToIndexNow(
  urls: string[],
  options?: {
    host?: string;
    apiKey?: string;
  }
): Promise<IndexNowResponse> {
  const apiKey = options?.apiKey || process.env.INDEXNOW_API_KEY || DEFAULT_KEY;
  const host = options?.host || process.env.NEXT_PUBLIC_SITE_DOMAIN || DEFAULT_HOST;
  const keyLocation = `https://${host}/${apiKey}.txt`;

  // Filter and sanitize valid URLs belonging to our host
  const validUrls = Array.from(
    new Set(
      urls
        .map((u) => u.trim())
        .filter((u) => u.startsWith('http://') || u.startsWith('https://'))
    )
  );

  if (validUrls.length === 0) {
    return {
      success: false,
      status: 400,
      message: 'No valid URLs provided to submit to IndexNow',
      submittedCount: 0,
    };
  }

  // IndexNow accepts up to 10,000 URLs per request
  const batch = validUrls.slice(0, 10000);

  const payload = {
    host,
    key: apiKey,
    keyLocation,
    urlList: batch,
  };

  try {
    const response = await fetch(INDEXNOW_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });

    // 200 = OK, 202 = Accepted (Key valid, URLs queued)
    const isSuccess = response.status === 200 || response.status === 202;

    let responseText = '';
    try {
      responseText = await response.text();
    } catch {
      // ignore
    }

    if (isSuccess) {
      return {
        success: true,
        status: response.status,
        message: response.status === 202 ? 'URLs accepted for indexing (202 Accepted)' : 'URLs submitted successfully (200 OK)',
        submittedCount: batch.length,
      };
    }

    // Common IndexNow error codes:
    // 400 = Invalid format
    // 403 = Key not valid or key file not found on host
    // 422 = URLs do not match key host
    // 429 = Too Many Requests
    return {
      success: false,
      status: response.status,
      message: `IndexNow responded with status ${response.status}: ${responseText || response.statusText}`,
      submittedCount: 0,
    };
  } catch (error: any) {
    console.error('Failed to submit URLs to IndexNow:', error);
    return {
      success: false,
      status: 500,
      message: error?.message || 'Network error submitting to IndexNow',
      submittedCount: 0,
    };
  }
}
