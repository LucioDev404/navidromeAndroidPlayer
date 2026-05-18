import 'package:dio/dio.dart';

import '../../../core/models/credentials.dart';
import '../../../core/services/secure_storage_service.dart';

class LoginRepository {
  LoginRepository(this._dio, this._storageService);

  final Dio _dio;
  final SecureStorageService _storageService;

  Future<bool> authenticate(Credentials credentials) async {
    final rawUrl = credentials.serverUrl.trim().replaceAll(RegExp(r'/+$'), '');
    final serverUrl = rawUrl.startsWith(RegExp(r'https?://')) ? rawUrl : 'https://$rawUrl';
    final uri = Uri.parse(serverUrl).replace(
      path: 'rest/ping.view',
      queryParameters: {
        'u': credentials.username,
        'p': credentials.password,
        'v': '1.16.1',
        'c': 'flutter-player',
        'f': 'json',
      },
    );

    final response = await _dio.getUri(uri);

    final data = response.data;
    if (data is Map<String, dynamic>) {
      final status = data['status'] as String? ?? (data['subsonic-response']?['status'] as String?);
      if (status == 'ok') {
        return true;
      }
      throw LoginException('Invalid server response.');
    }

    throw LoginException('Unable to validate server connection.');
  }

  Future<void> saveCredentials(Credentials credentials) async {
    await _storageService.saveCredentials(credentials);
  }

  Future<Credentials?> loadSavedCredentials() async {
    return _storageService.loadCredentials();
  }
}

class LoginException implements Exception {
  LoginException(this.message);

  final String message;

  @override
  String toString() => 'LoginException: $message';
}
