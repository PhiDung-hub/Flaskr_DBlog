I brought the login to the main page as we don't need a seperate url for registration. 

Trying to handle "accountsChanged" event to log out user when they select a different account. But I think MetaMask doesn't allow much interaction. On MetaFora, I can still use old account to post even when disconnected or change (on MetaMask) to other account. 

For logging out function, now I use FLASK's `session.clear()` and try adding Web3Modal.clearCachedProvider(). Don't know if is there any shortcomings. But the `onDisconnect()` from `static/js/login.js` haven't been called, I'm still trying to fix it.

Profile is to register username, default is user address.

`example.html` and `index.html` are brought from Web3Modal vanilla js example. Not part of the app.

`metafora_main.js` is main script from http://metafora.app. This is to see how the login flow work, *(line **131** to **200** for metamask auth)*

`node_modules` are not used, I'm just testing browserify to import module to client side but haven't worked yet. Unpkg CDN is being used for now.


Running the app:
```
pip install -r requirements.txt
export FLASK_APP=flaskr
export FLASK_ENV=development
flask run
```
