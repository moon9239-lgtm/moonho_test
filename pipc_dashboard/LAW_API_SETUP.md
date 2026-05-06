# Local law API setup

Create `pipc_dashboard/.env.local` once and keep the API key there:

```env
LAW_OC=your_law_api_key_here
PORT=5190
```

The local server reads `.env.local` and `.env` on every law lookup request, so the key does not need to be typed into PowerShell each time. Law lookup responses are cached under `data/law-cache/` after the first successful request.
