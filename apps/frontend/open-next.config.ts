import { defineCloudflareConfig } from '@opennextjs/cloudflare/config';
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache';
import d1NextTagCache from '@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache';

export default defineCloudflareConfig({
    incrementalCache: staticAssetsIncrementalCache,
    tagCache: d1NextTagCache,
});
