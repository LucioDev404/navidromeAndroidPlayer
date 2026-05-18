import 'package:flutter/material.dart';

import '../constants/app_colors.dart';
import 'typography.dart';

class AppTheme {
  static final ThemeData dark = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    scaffoldBackgroundColor: AppColors.background,
    canvasColor: AppColors.card,
    cardColor: AppColors.card,
    splashFactory: InkSparkle.splashFactory,
    visualDensity: VisualDensity.adaptivePlatformDensity,
    colorScheme: const ColorScheme.dark(
      primary: AppColors.accent,
      onPrimary: AppColors.white,
      secondary: AppColors.secondary,
      surface: AppColors.card,
      onSurface: AppColors.white,
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: AppColors.surface,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: AppTypography.textTheme.titleLarge,
      iconTheme: const IconThemeData(color: AppColors.white),
    ),
    textTheme: AppTypography.textTheme,
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.surfaceVariant,
      hintStyle: AppTypography.textTheme.bodySmall?.copyWith(color: AppColors.surfaceText),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(24),
        borderSide: BorderSide.none,
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        foregroundColor: AppColors.white,
        backgroundColor: AppColors.accent,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
      ),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: AppColors.surface,
      selectedItemColor: AppColors.accent,
      unselectedItemColor: AppColors.surfaceText,
      showUnselectedLabels: false,
    ),
  );

  static final ThemeData light = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    scaffoldBackgroundColor: AppColors.lightBackground,
    colorScheme: const ColorScheme.light(
      primary: AppColors.accent,
      onPrimary: AppColors.white,
      secondary: AppColors.secondary,
      surface: AppColors.lightSurface,
      onSurface: AppColors.black,
    ),
    textTheme: AppTypography.textTheme,
  );
}
