# JobFit

Paste a job posting and your CV. Each requirement in the posting is scored against your CV and sorted into met, worth addressing, and not evidenced. The middle group is the point: those are the lines to write about in a cover letter.

Runs on TypeSafe's Jev model through Vercel AI Gateway, and falls back to TypeSafe's own API when the Gateway call fails. Jev answers typed questions with probabilities instead of generating text, which is what makes the "worth addressing" bucket possible.

## Run it

```bash
npm install
cp .env.example .env.local   # add AI_GATEWAY_API_KEY and/or TYPESAFE_API_KEY
npm run dev
```

## Config

| Variable | Default | What it does |
| --- | --- | --- |
| `AI_GATEWAY_API_KEY` | one of the two | Vercel AI Gateway key, tried first |
| `TYPESAFE_API_KEY` | one of the two | TypeSafe API key, used when the Gateway is missing or fails |
| `RATE_LIMIT_ANALYZE` | `2` | checks per IP per window |
| `RATE_LIMIT_EXTRACT` | `5` | PDF uploads per IP per window |
| `RATE_LIMIT_WINDOW_MS` | `3600000` | window length, one hour |

The rate limiter is in-memory, so it is per serverless instance. Good enough for a demo, not for real traffic.
