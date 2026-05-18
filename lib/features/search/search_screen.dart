import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../core/constants/app_sizes.dart';
import '../../shared/widgets/blur_card.dart';

class SearchScreen extends StatelessWidget {
  const SearchScreen({super.key});

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
                Text('Search', style: Theme.of(context).textTheme.displaySmall),
                const SizedBox(height: 16),
                const _SearchBar(),
                const SizedBox(height: 24),
              ],
            ),
          ),
          SliverToBoxAdapter(
            child: Wrap(
              spacing: 12,
              runSpacing: 12,
              children: List.generate(
                6,
                (index) => Chip(
                  label: Text('Genre ${index + 1}'),
                  backgroundColor: AppColors.surface,
                  labelStyle: Theme.of(context).textTheme.bodyMedium,
                ),
              ),
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 24)),
        ],
      ),
    );
  }
}

class _SearchBar extends StatelessWidget {
  const _SearchBar();

  @override
  Widget build(BuildContext context) {
    return BlurCard(
      child: TextField(
        decoration: const InputDecoration(
          hintText: 'Search for songs, albums, or artists',
          prefixIcon: Icon(Icons.search_rounded),
        ),
      ),
    );
  }
}
