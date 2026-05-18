class LoginState {
  final String serverUrl;
  final String username;
  final String password;
  final String? errorMessage;
  final bool isLoading;

  const LoginState({
    this.serverUrl = '',
    this.username = '',
    this.password = '',
    this.errorMessage,
    this.isLoading = false,
  });

  bool get canSubmit => serverUrl.isNotEmpty && username.isNotEmpty && password.isNotEmpty;

  LoginState copyWith({
    String? serverUrl,
    String? username,
    String? password,
    String? errorMessage,
    bool? isLoading,
  }) {
    return LoginState(
      serverUrl: serverUrl ?? this.serverUrl,
      username: username ?? this.username,
      password: password ?? this.password,
      errorMessage: errorMessage,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}
