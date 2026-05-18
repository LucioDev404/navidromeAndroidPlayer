import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/constants/app_colors.dart';
import '../../core/constants/app_sizes.dart';
import 'gradient_background.dart';
import 'blur_card.dart';

class BottomNavShell extends StatelessWidget {
  const BottomNavShell({super.key, required this.child});

  final Widget child;

  int _activeIndex(String location) {
    if (location.startsWith('/search')) return 2;
    if (location.startsWith('/library')) return 1;
    return 0;
  }

  static const _items = [
    NavigationDestination(icon: Icon(Icons.home_rounded), label: 'Home'),
    NavigationDestination(icon: Icon(Icons.library_music_rounded), label: 'Library'),
    NavigationDestination(icon: Icon(Icons.search_rounded), label: 'Search'),
  ];

  @override
  Widget build(BuildContext context) {
    final location = GoRouter.of(context).location;
    final currentIndex = _activeIndex(location);

    return GradientBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        body: SafeArea(
          child: Column(
            children: [
              Expanded(child: child),
              const _MiniPlayerPlaceholder(),
              const SizedBox(height: 10),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSizes.pagePadding),
                child: BlurCard(
                  child: NavigationBar(
                    height: 72,
                    selectedIndex: currentIndex,
                    onDestinationSelected: (index) {
                      switch (index) {
                        case 0:
                          context.go('/home');
                          break;
                        case 1:
                          context.go('/library');
                          break;
                        case 2:
                          context.go('/search');
                          break;
                      }
                    },
                    destinations: _items,
                  ),
                ),
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }
}

class _MiniPlayerPlaceholder extends StatelessWidget {
  const _MiniPlayerPlaceholder();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSizes.pagePadding),
      child: BlurCard(
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              Container(
                height: 54,
                width: 54,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  gradient: const LinearGradient(
                    colors: [Color(0xFF1DB954), Color(0xFF29A96E)],
                  ),
                ),
                child: const Icon(Icons.music_note_rounded, color: Colors.white),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text('Waiting for playback', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                    SizedBox(height: 4),
                    Text('Tap to open player', style: TextStyle(fontSize: 12, color: AppColors.surfaceText)),
                  ],
                ),
              ),
              IconButton(
                onPressed: () {},
                icon: const Icon(Icons.play_arrow_rounded, color: AppColors.accent),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
