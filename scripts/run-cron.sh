#!/bin/sh
# Calls one of the scheduled routes under /api/cron from a plain server cron (Hostinger hPanel
# "Cron Jobs"), replacing Vercel Cron when the site is self-hosted. See docs/SELF_HOSTING.md.
#
#   run-cron.sh collect-ideas | generate-blog | blog-report | blog-results
#
# CRON_SECRET (the same value as the site's CRON_SECRET env var) and optionally SITE_URL are read
# from the environment or from ~/.mimar-cron.env (override the path with MIMAR_CRON_ENV). Keep that
# file private (chmod 600) and out of git. The secret is sent only in a request header and is never
# printed.

job="$1"
case "$job" in
  collect-ideas | generate-blog | blog-report | blog-results | publish-scheduled) ;;
  *)
    echo "usage: run-cron.sh collect-ideas | generate-blog | blog-report | blog-results | publish-scheduled" >&2
    exit 64
    ;;
esac

env_file="${MIMAR_CRON_ENV:-$HOME/.mimar-cron.env}"
if [ -f "$env_file" ]; then
  # shellcheck disable=SC1090
  . "$env_file"
fi

if [ -z "$CRON_SECRET" ]; then
  echo "CRON_SECRET is not set (environment or $env_file)" >&2
  exit 78
fi

site="${SITE_URL:-https://mim.archi}"

# The drafting and result jobs can run for up to 300 s (maxDuration in each route), so allow
# slightly more than that. -f turns an HTTP error (401, 500) into a non-zero exit.
exec curl -fsS --max-time 330 \
  -H "Authorization: Bearer $CRON_SECRET" \
  "$site/api/cron/$job"
