# PHP and MySQL upload API

The administrator dashboard sends one file per request to `POST /api/upload.php`, including its category and unit code. PHP checks the category, unit code, size, extension, and detected MIME type, saves the file under `backend/storage/uploads`, then stores its metadata in MySQL. Students search the JSON endpoint `GET /api/materials.php?unit_code=SCS%20104` (optionally adding `&category=notes`, `assignments`, or `past_papers`) and view or download results through `GET /api/download.php?id=<id>`.

## Local setup

1. Install PHP 7.4 or newer with the `pdo_mysql` and `fileinfo` extensions, plus MySQL. Set `upload_max_filesize` to at least `15M` and `post_max_size` to at least `16M` in `php.ini`.
2. Run `backend/database.sql` with your MySQL client (or import it using phpMyAdmin) to create the database and upload table. For a database created before unit-code search was added, run `backend/migrations/20261103_add_unit_code.sql`.
3. Set `DB_HOST`, `DB_NAME`, `DB_USER`, and `DB_PASS` in the environment where PHP runs. Defaults are `127.0.0.1`, `okoa_sem`, `root`, and an empty password for a local development database. In PowerShell, for example, set `$env:DB_USER = 'root'` and `$env:DB_PASS = 'your-local-password'` in the terminal before starting PHP.
4. From the project root, start PHP with `php -S 127.0.0.1:8000 -t backend/public`.
5. In a second terminal, run `npm run dev` from the project root. Vite forwards `/api` requests to PHP at `127.0.0.1:8000`.

For deployment, serve the React build and route `/api` to `backend/public`; keep `backend/storage` outside the web document root and set database credentials through the host's environment configuration. The API endpoints do not yet verify Firebase identity or roles. Restrict `POST /api/upload.php` to trusted administrators at the server or hosting layer before exposing the API publicly.
