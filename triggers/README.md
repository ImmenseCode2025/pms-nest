# Sync triggers

Har synced table ki ek file: `sync_<table>.sql`. Ye triggers table ki har insert / update / delete
`sync_changes` mein likhte hain, aur site servers (realpark) `POST /api/sync/corporates` (body: `site_id`, `after_id`, `limit`) sy changes uthate hain.

## Naya table sync mein add karna (2 kaam)

1. **Trigger file** — `sync_corporates.sql` copy karo, naam `sync_<table>.sql` rakho, aur andar har
   jagah `corporates` ko naye table ke naam sy badlo. Phir file live MySQL pr chalao.
2. **API** — `src/sync/` mein us table ka alag endpoint banao (corporates wale jaisa), sirf zaroori fields
   (password / email jaise sensitive fields kabhi nahi).

## Chalana

```bash
mysql -u <user> -p <database> < triggers/sync_corporates.sql
```

DB user ko `TRIGGER` permission chahiye. Binary logging on ho aur user SUPER na ho to
`log_bin_trust_function_creators = 1` bhi chahiye.
