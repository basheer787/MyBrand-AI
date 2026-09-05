// Server-only helper. Never import this from a client component —
// it assumes access to META_APP_ID / META_APP_SECRET which must stay server-side.

const GRAPH_VERSION = "v21.0";
const GRAPH_URL = `https://graph.facebook.com/${GRAPH_VERSION}`;

export function metaConfigured() {
  return Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET);
}

export function metaAuthUrl(redirectUri: string, state: string) {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: redirectUri,
    state,
    response_type: "code",
    scope: [
      "pages_show_list",
      "pages_read_engagement",
      "pages_manage_posts",
      "instagram_basic",
      "instagram_content_publish",
      "business_management",
    ].join(","),
  });
  return `https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth?${params.toString()}`;
}

async function graphFetch(path: string, params: Record<string, string>) {
  const url = `${GRAPH_URL}${path}?${new URLSearchParams(params).toString()}`;
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error?.message ?? `Meta API request failed for ${path}`);
  }
  return data;
}

export async function exchangeCodeForUserToken(code: string, redirectUri: string) {
  const data = await graphFetch("/oauth/access_token", {
    client_id: process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    redirect_uri: redirectUri,
    code,
  });
  return data.access_token as string;
}

export async function getLongLivedUserToken(shortLivedToken: string) {
  const data = await graphFetch("/oauth/access_token", {
    grant_type: "fb_exchange_token",
    client_id: process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    fb_exchange_token: shortLivedToken,
  });
  return data.access_token as string;
}

type PageWithInstagram = {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: { id: string; username?: string };
};

export async function getPagesForUser(userToken: string) {
  const data = await graphFetch("/me/accounts", {
    fields: "id,name,access_token,instagram_business_account{id,username}",
    access_token: userToken,
  });
  return (data.data ?? []) as PageWithInstagram[];
}

export async function publishInstagramPost(opts: {
  igBusinessId: string;
  pageAccessToken: string;
  imageUrl: string;
  caption: string;
}) {
  const container = await graphFetch(`/${opts.igBusinessId}/media`, {
    image_url: opts.imageUrl,
    caption: opts.caption,
    access_token: opts.pageAccessToken,
  });
  const published = await graphFetch(`/${opts.igBusinessId}/media_publish`, {
    creation_id: container.id,
    access_token: opts.pageAccessToken,
  });
  return published.id as string;
}

export async function publishFacebookPhotoPost(opts: {
  pageId: string;
  pageAccessToken: string;
  imageUrl: string;
  caption: string;
}) {
  const published = await graphFetch(`/${opts.pageId}/photos`, {
    url: opts.imageUrl,
    caption: opts.caption,
    access_token: opts.pageAccessToken,
  });
  return published.post_id ?? (published.id as string);
}
