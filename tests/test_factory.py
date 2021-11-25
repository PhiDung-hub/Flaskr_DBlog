from flaskr import create_app


def test_config():
    """
    Assert app is created in testing mode.
    """
    assert not create_app().testing
    assert create_app({'TESTING': True}).testing


def test_hello(client):
    """
    Assert default message when app is created
    """
    response = client.get('/hello')
    assert response.data == b'Hello, World!'
