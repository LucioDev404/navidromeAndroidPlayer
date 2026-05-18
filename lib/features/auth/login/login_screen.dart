import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_sizes.dart';
import '../../../core/theme/typography.dart';
import '../../../shared/widgets/blur_card.dart';
import '../../../shared/widgets/gradient_background.dart';
import 'login_controller.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(loginControllerProvider);

    return GradientBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSizes.pagePadding),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 28),
                Text('Welcome back', style: AppTypography.textTheme.displaySmall),
                const SizedBox(height: 8),
                Text(
                  'Connect to your Navidrome server and start listening.',
                  style: AppTypography.textTheme.bodyLarge?.copyWith(color: AppColors.surfaceText),
                ),
                const SizedBox(height: 30),
                Expanded(
                  child: BlurCard(
                    child: Padding(
                      padding: const EdgeInsets.all(AppSizes.cardPadding),
                      child: Form(
                        key: _formKey,
                        child: ListView(
                          shrinkWrap: true,
                          children: [
                            TextFormField(
                              initialValue: state.serverUrl,
                              decoration: const InputDecoration(labelText: 'Server URL'),
                              keyboardType: TextInputType.url,
                              onChanged: ref.read(loginControllerProvider.notifier).updateServerUrl,
                              validator: (value) => value?.isEmpty == true ? 'Server URL is required' : null,
                            ),
                            const SizedBox(height: 16),
                            TextFormField(
                              initialValue: state.username,
                              decoration: const InputDecoration(labelText: 'Username'),
                              onChanged: ref.read(loginControllerProvider.notifier).updateUsername,
                              validator: (value) => value?.isEmpty == true ? 'Username is required' : null,
                            ),
                            const SizedBox(height: 16),
                            TextFormField(
                              initialValue: state.password,
                              decoration: const InputDecoration(labelText: 'Password'),
                              obscureText: true,
                              onChanged: ref.read(loginControllerProvider.notifier).updatePassword,
                              validator: (value) => value?.isEmpty == true ? 'Password is required' : null,
                            ),
                            if (state.errorMessage != null) ...[
                              const SizedBox(height: 18),
                              Text(state.errorMessage!, style: const TextStyle(color: Colors.redAccent)),
                            ],
                            const SizedBox(height: 24),
                            ElevatedButton(
                              onPressed: state.isLoading ? null : () async {
                                final router = GoRouter.of(context);
                                if (_formKey.currentState?.validate() != true) return;
                                final success = await ref.read(loginControllerProvider.notifier).submit();
                                if (!mounted) return;
                                if (success) {
                                  router.go('/home');
                                }
                              },
                              child: state.isLoading
                                  ? const SizedBox(
                                      height: 18,
                                      child: Center(
                                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                      ),
                                    )
                                  : const Text('Connect'),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 18),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
