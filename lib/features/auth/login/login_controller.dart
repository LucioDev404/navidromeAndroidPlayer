import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/models/credentials.dart';
import '../../../core/providers.dart';
import 'login_repository.dart';
import 'login_state.dart';

final loginControllerProvider = StateNotifierProvider<LoginController, LoginState>(
  (ref) {
    final dio = ref.read(dioProvider);
    final storage = ref.read(secureStorageProvider);
    return LoginController(LoginRepository(dio, SecureStorageService(storage)));
  },
);

final loginRepositoryProvider = Provider<LoginRepository>(
  (ref) {
    final dio = ref.read(dioProvider);
    final storage = ref.read(secureStorageProvider);
    return LoginRepository(dio, SecureStorageService(storage));
  },
);

class LoginController extends StateNotifier<LoginState> {
  LoginController(this._repository) : super(const LoginState());

  final LoginRepository _repository;

  void updateServerUrl(String value) => state = state.copyWith(serverUrl: value, errorMessage: null);

  void updateUsername(String value) => state = state.copyWith(username: value, errorMessage: null);

  void updatePassword(String value) => state = state.copyWith(password: value, errorMessage: null);

  Future<bool> submit() async {
    if (!state.canSubmit) {
      state = state.copyWith(errorMessage: 'Please fill all fields.');
      return false;
    }

    state = state.copyWith(isLoading: true, errorMessage: null);
    final credentials = Credentials(
      serverUrl: state.serverUrl,
      username: state.username,
      password: state.password,
    );

    try {
      final success = await _repository.authenticate(credentials);
      if (success) {
        await _repository.saveCredentials(credentials);
        state = state.copyWith(isLoading: false);
        return true;
      }
      state = state.copyWith(isLoading: false, errorMessage: 'Unable to sign in.');
      return false;
    } catch (error) {
      state = state.copyWith(isLoading: false, errorMessage: error is LoginException ? error.message : 'Unable to connect to server.');
      return false;
    }
  }
}
