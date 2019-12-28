COOKIE_FILENAME = '.cookie'

def read_cookie():
    return open('.cookie', 'r').read().strip()

def headers():
    return {'cookie': read_cookie()}
