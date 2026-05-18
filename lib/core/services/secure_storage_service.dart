import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../models/credentials.dart';

class SecureStorageService {
  SecureStorageService(this._storage);

  final FlutterSecureStorage _storage;

  static const _serverUrlKey = 'serverUrl';
  static const _usernameKey = 'username';
  static const _passwordKey = 'password';

  Future<void> saveCredentials(Credentials credentials) async {
    await _storage.write(key: _serverUrlKey, value: credentials.serverUrl);
    await _storage.write(key: _usernameKey, value: credentials.username);
    await _storage.write(key: _passwordKey, value: credentials.password);
  }

  Future<Credentials?> loadCredentials() async {
    final serverUrl = await _storage.read(key: _serverUrlKey);
    final username = await _storage.read(key: _usernameKey);
    final password = await _storage.read(key: _passwordKey);

    if (serverUrl == null || username == null || password == null) {
      return null;
    }

    return Credentials(serverUrl: serverUrl, username: username, password: password);
  }

  Future<void> clearCredentials() async {
    await _storage.delete(key: _serverUrlKey);
    await _storage.delete(key: _usernameKey);
    await _storage.delete(key: _passwordKey);
  }
}
