import { httpLink, httpBatchStreamLink } from "@repo/trpc/client";
import { env } from "~/env.js";

interface CreateTRPCHttpBatchClientClientOpts {
  enableStreaming?: boolean;
}

const getTrpcUrl = () => {
  const rawBaseUrl = env.NEXT_PUBLIC_API_URL?.trim();

  if (!rawBaseUrl) {
    return "http://localhost:8000/trpc";
  }

  if (rawBaseUrl.startsWith("/")) {
    return rawBaseUrl.endsWith("/trpc") ? rawBaseUrl : `${rawBaseUrl.replace(/\/+$/, "")}/trpc`;
  }

  try {
    const url = new URL(rawBaseUrl);
    if (!url.pathname || url.pathname === "/") {
      url.pathname = "/trpc";
      return url.toString();
    }
    if (!url.pathname.endsWith("/trpc")) {
      url.pathname = `${url.pathname.replace(/\/+$/, "")}/trpc`;
    }
    return url.toString();
  } catch {
    return "http://localhost:8000/trpc";
  }
};

export const createTRPCHttpBatchClientClient = (opts?: CreateTRPCHttpBatchClientClientOpts) => {
  const c = opts?.enableStreaming ? httpBatchStreamLink : httpLink;
  return c({
    url: getTrpcUrl(),
    fetch(url, options) {
      return fetch(url, {
        ...options,
        credentials: "include",
      });
    },
  });
};
