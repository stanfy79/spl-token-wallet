import { useAsyncData } from '../fetch-loop';

// Define a custom error class for handling swap API errors
export class SwapApiError extends Error {
  constructor(msg, status) {
    super(msg);
    this.name = 'SwapApiError';
    this.status = status;
  }
}

// Function to handle the swap API request
export async function swapApiRequest(
  method,
  path,
  body,
  { ignoreUserErrors = false } = {},
) {
  let headers = {};
  let params = { headers, method };
  if (method === 'GET') {
    params.cache = 'no-cache';
  } else if (body) {
    headers['Content-Type'] = 'application/json';
    params.body = JSON.stringify(body);
  }

  // Fetch data from the OpenBook API
  let resp = await fetch(`https://api.openbook.ag/${path}`, params);
  return await handleSwapApiResponse(resp, ignoreUserErrors);
}

// Function to handle the response from the swap API
async function handleSwapApiResponse(resp, ignoreUserErrors) {
  let json = await resp.json();
  if (!json.success) {
    if (ignoreUserErrors && resp.status >= 400 && resp.status < 500) {
      return null;
    }
    throw new SwapApiError(json.error, resp.status);
  }
  return json.result;
}

// Custom hook to fetch data using the swap API
export function useSwapApiGet(path, options) {
  return useAsyncData(
    async () => {
      if (!path) {
        return null;
      }
      return await swapApiRequest('GET', path, undefined, {
        ignoreUserErrors: true,
      });
    },
    ['swapApiGet', path],
    options,
  );
}
