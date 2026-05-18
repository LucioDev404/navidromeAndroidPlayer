import 'package:flutter/material.dart';

class ResponsiveLayout {
  ResponsiveLayout._();

  static bool isTablet(BuildContext context) => MediaQuery.of(context).size.width >= 720;
  static bool isDesktop(BuildContext context) => MediaQuery.of(context).size.width >= 1024;

  static double horizontalPadding(BuildContext context) {
    if (isDesktop(context)) return 48;
    if (isTablet(context)) return 28;
    return 20;
  }
}
