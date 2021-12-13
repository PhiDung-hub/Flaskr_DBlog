import functools
from os import error
import sys
# Flask browser and session utilities.
from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for
)
# For web 2.0 login style
from werkzeug.security import check_password_hash, generate_password_hash
# convention database
from flaskr.db import get_db

from web3.auto import w3  # web3.py library. Might need in the future?
from eth_account.messages import encode_defunct

from datetime import datetime

# Blue print for routing
bp = Blueprint("auth", __name__, url_prefix="/")


# Require authentication for other views.
def login_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            return redirect(url_for('auth.login'))

        return view(**kwargs)

    return wrapped_view


@bp.route('/profile', methods=('GET', 'POST'))
@login_required
def profile():
    """ This function register a profile for an user address. The feature 
    is optional. Example: (need to sign in) 
    """
    if request.method == 'POST':
        db = get_db()
        error = None
        user_id = session.get('user_id')
        user = db.execute(
            'SELECT * FROM user WHERE id = ?', (user_id,)
        ).fetchone()

        # get new username
        username = request.form['username']

        if not username:
            error = 'Please enter username'

        if user is None:
            error = 'Backend error'

        print(user['public_address'])

        if error is None and user is not None:
            try:
                db.execute(
                    'UPDATE user SET username = ? WHERE public_address = ?',
                    (username, user['public_address'],)
                )
                db.commit()
            except db.IntegrityError:
                error = f'Username {username} already exists'
            else:
                return redirect(url_for('index'))
        flash(error)

    return render_template("auth/profile.html")


@bp.route('/login', methods=('GET', 'POST'))
def login():
    if request.method == 'POST':
        usr_data = request.form
        print("POST data: ", usr_data, file=sys.stderr)  # for debugging

        account = usr_data['account']
        signature = usr_data['signature']
        # Get the authentication message.
        msg = "I agree to login on this page.\nLogin time: " + \
            datetime.now().strftime("%m/%d/%Y")
        print("Authentication msg: ", msg)  # for logging
        msg = encode_defunct(text=msg)
        signature = w3.toBytes(hexstr=signature)
        # print("signature:", signature)
        signed_address = w3.eth.account.recover_message(
            msg, signature=signature).lower()

        valid = (account == signed_address)
        print("account:", account)
        print("signed_address:", signed_address)

        db = get_db()

        error = None

        if not valid:
            error = 'Invalid signature or time out, please try again'

        user = db.execute(
            'SELECT * FROM user WHERE public_address = ?', (account,)
        ).fetchone()

        if user is None:
            db.execute(
                'INSERT INTO user (public_address , username) VALUES (?, ?)',
                # default name is the account address. Custom name is added with registeration button.
                (account, account,)
            )
            db.commit()
            # select again
            user = db.execute(
                'SELECT * FROM user WHERE public_address = ?', (account,)
            ).fetchone()

        if error is None:
            print(f"Index to redirect: {url_for('index')}")
            session.clear()
            session['user_id'] = user['id']
            print("This is working, user id: ", session.get('user_id'))
            return url_for('index')

        flash(error)

    return render_template('auth/login.html')


@bp.before_app_request
def load_logged_in_user():
    user_id = session.get('user_id')

    if user_id is None:
        g.user = None
    else:
        g.user = get_db().execute(
            'SELECT * FROM user WHERE id = ?', (user_id,)
        ).fetchone()


# Log out.
@bp.route('/logout', methods=('GET', 'POST'))
def logout():
    if request.method == 'POST':
        print(request.form)
    session.clear()
    return redirect(url_for('index'))
