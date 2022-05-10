# FLASK Blog tutorial, but with ethereum

Profile is to register username, default is user address.

`node_modules` are not used, I'm just testing browserify to import module to client side but haven't worked yet. Unpkg CDN is being used for now.

Running the app:

```sh
wsl
python -m venv ./venv
. venv/bin/activate
pip install -r requirements.txt
export FLASK_APP=flaskr
export FLASK_ENV=development
flask run
```

Restart database:

```sh
export FLASK_APP=flaskr
flask init-db
```
