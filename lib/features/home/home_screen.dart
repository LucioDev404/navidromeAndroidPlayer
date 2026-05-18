import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../core/constants/app_sizes.dart';
import '../../shared/widgets/blur_card.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSizes.pagePadding),
      child: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 28),
                Text('Good evening', style: Theme.of(context).textTheme.displaySmall),
                const SizedBox(height: 16),
                Text('Your music, beautifully organised.', style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: AppColors.surfaceText)),
                const SizedBox(height: 28),
              ],
            ),
          ),
          SliverToBoxAdapter(
            child: _SectionCard(title: 'Recently played'),
          ),
          SliverToBoxAdapter(
            child: const SizedBox(height: AppSizes.sectionSpacing),
          ),
          SliverToBoxAdapter(
            child: _SectionCard(title: 'Recommended albums'),
          ),
          SliverToBoxAdapter(
            child: const SizedBox(height: AppSizes.sectionSpacing),
          ),
          SliverToBoxAdapter(
            child: _SectionCard(title: 'Fresh finds'),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 24)),
        ],
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  const _SectionCard({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    return BlurCard(
      child: Padding(
        padding: const EdgeInsets.all(AppSizes.cardPadding),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 16),
            Row(
              children: [
                _AlbumTile(label: 'Today', color: const Color(0xFF515A6B)),
                const SizedBox(width: 12),
                _AlbumTile(label: 'Discover', color: const Color(0xFF1DB954)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _AlbumTile extends StatelessWidget {
  const _AlbumTile({required this.label, required this.color});

  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        height: 120,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(18),
          gradient: LinearGradient(colors: [color.withOpacity(0.95), color.withOpacity(0.65)]),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Align(
            alignment: Alignment.bottomLeft,
            child: Text(label, style: Theme.of(context).textTheme.titleMedium?.copyWith(color: AppColors.white)),
          ),
        ),
      ),
    );
  }
}
