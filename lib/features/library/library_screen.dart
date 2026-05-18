import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../core/constants/app_sizes.dart';
import '../../shared/widgets/blur_card.dart';

class LibraryScreen extends StatelessWidget {
  const LibraryScreen({super.key});

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
                Text('Library', style: Theme.of(context).textTheme.displaySmall),
                const SizedBox(height: 12),
                Text('Browse your albums, artists, and playlists.', style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: AppColors.surfaceText)),
                const SizedBox(height: 24),
              ],
            ),
          ),
          SliverGrid(
            delegate: SliverChildBuilderDelegate(
              (context, index) => _LibraryItem(index: index),
              childCount: 6,
            ),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              childAspectRatio: 1.1,
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 24)),
        ],
      ),
    );
  }
}

class _LibraryItem extends StatelessWidget {
  const _LibraryItem({required this.index});

  final int index;

  @override
  Widget build(BuildContext context) {
    return BlurCard(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(18),
                  gradient: const LinearGradient(colors: [Color(0xFF252D3B), Color(0xFF1A212B)]),
                ),
              ),
            ),
            const SizedBox(height: 14),
            Text('Album ${index + 1}', style: Theme.of(context).textTheme.titleSmall),
            const SizedBox(height: 6),
            Text('Artist name', style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.surfaceText)),
          ],
        ),
      ),
    );
  }
}
