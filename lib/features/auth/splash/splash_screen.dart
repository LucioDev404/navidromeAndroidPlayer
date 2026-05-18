import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../login/login_controller.dart';
import '../../../shared/widgets/gradient_background.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_sizes.dart';
import '../../../core/theme/typography.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<ConsumerStatefulWidget> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _initialize());
  }

  Future<void> _initialize() async {
    await Future.delayed(const Duration(milliseconds: 1700));
    final repository = ref.read(loginRepositoryProvider);
    final savedCredentials = await repository.loadSavedCredentials();

    if (mounted) {
      if (savedCredentials != null) {
        context.go('/home');
      } else {
        context.go('/login');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return GradientBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSizes.pagePadding),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const SizedBox(height: 32),
                Expanded(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const _SplashArtwork(),
                      const SizedBox(height: 28),
                      Text('Player', style: AppTypography.textTheme.displaySmall?.copyWith(letterSpacing: -1.2)),
                      const SizedBox(height: 14),
                      Text(
                        'Premium self-hosted streaming for Navidrome',
                        style: AppTypography.textTheme.bodyLarge?.copyWith(color: AppColors.surfaceText),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
                const CircularProgressIndicator(color: AppColors.accent),
                const SizedBox(height: 42),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _SplashArtwork extends StatelessWidget {
  const _SplashArtwork();

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.center,
      children: [
        Container(
          width: 190,
          height: 190,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: RadialGradient(
              colors: [AppColors.accent.withAlpha(72), Colors.transparent],
              radius: 0.7,
            ),
          ),
        ),
        Container(
          width: 136,
          height: 136,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(40),
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Color(0xFF1DB954), Color(0xFF0D8155)],
            ),
            boxShadow: [
              BoxShadow(
                color: AppColors.accent.withAlpha(61),
                blurRadius: 32,
                offset: const Offset(0, 18),
              ),
            ],
          ),
          child: const Icon(
            Icons.play_circle_fill_rounded,
            size: 70,
            color: Colors.white,
          ),
        ),
      ],
    );
  }
}
