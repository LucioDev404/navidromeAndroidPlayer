import 'package:go_router/go_router.dart';

import 'features/auth/login/login_screen.dart';
import 'features/auth/splash/splash_screen.dart';
import 'features/home/home_screen.dart';
import 'features/library/library_screen.dart';
import 'features/search/search_screen.dart';
import 'shared/widgets/bottom_nav_shell.dart';

final appRouter = GoRouter(
  initialLocation: '/splash',
  routes: [
    GoRoute(
      path: '/splash',
      name: 'splash',
      builder: (context, state) => const SplashScreen(),
    ),
    GoRoute(
      path: '/login',
      name: 'login',
      builder: (context, state) => const LoginScreen(),
    ),
    ShellRoute(
      builder: (context, state, child) => BottomNavShell(child: child),
      routes: [
        GoRoute(
          path: '/home',
          name: 'home',
          pageBuilder: (context, state) => const NoTransitionPage(child: HomeScreen()),
        ),
        GoRoute(
          path: '/library',
          name: 'library',
          pageBuilder: (context, state) => const NoTransitionPage(child: LibraryScreen()),
        ),
        GoRoute(
          path: '/search',
          name: 'search',
          pageBuilder: (context, state) => const NoTransitionPage(child: SearchScreen()),
        ),
      ],
    ),
  ],
);
