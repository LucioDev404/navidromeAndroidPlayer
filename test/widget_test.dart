import 'package:flutter_test/flutter_test.dart';

import 'package:player_android/app.dart';

void main() {
  testWidgets('App loads without crashing', (WidgetTester tester) async {
    await tester.pumpWidget(const App());
    await tester.pumpAndSettle();

    expect(find.byType(App), findsOneWidget);
    expect(find.text('Player'), findsWidgets);
  });
}
