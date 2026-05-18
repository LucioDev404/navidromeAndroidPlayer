class Credentials {
  final String serverUrl;
  final String username;
  final String password;

  Credentials({
    required this.serverUrl,
    required this.username,
    required this.password,
  });

  Map<String, String> toJson() => {
        'serverUrl': serverUrl,
        'username': username,
        'password': password,
      };

  factory Credentials.fromJson(Map<String, String> json) {
    return Credentials(
      serverUrl: json['serverUrl'] ?? '',
      username: json['username'] ?? '',
      password: json['password'] ?? '',
    );
  }
}
