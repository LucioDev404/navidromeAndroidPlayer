import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../core/constants/app_sizes.dart';
import '../../shared/widgets/blur_card.dart';

class PlayerShell extends StatelessWidget {
  const PlayerShell({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(AppSizes.pagePadding),
      child: BlurCard(
        child: Container(
          height: 130,
          padding: const EdgeInsets.all(20),
          decoration: const BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.all(Radius.circular(AppSizes.borderRadius)),
          ),
          child: Row(
            children: [
              Container(
                width: 90,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(18),
                  gradient: const LinearGradient(colors: [Color(0xFF1DB954), Color(0xFF29A96E)]),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: const [
                    Text('Player shell', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.white)),
                    SizedBox(height: 4),
                    Text('Track title • Artist', style: TextStyle(fontSize: 14, color: AppColors.surfaceText)),
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
