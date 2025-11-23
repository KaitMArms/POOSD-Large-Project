/*import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';

class ControllyLair extends StatefulWidget {
  const ControllyLair({super.key});

  @override
  State<ControllyLair> createState() => ControllyLairState();
}

class ControllyLairState extends State<ControllyLair> {
  @override
  void initState() {
    super.initState();
    // Force landscape for this page
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.landscapeRight,
    ]);
  }

  @override
  void dispose() {
    // Revert to default orientations when leaving
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.landscapeRight,
    ]);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: WebViewWidget(
        controller: WebViewController()
          ..setJavaScriptMode(JavaScriptMode.unrestricted)
          ..loadRequest(
            Uri.parse('https://raz0red.github.io/webprboom/'),
          ),
      ),
    );
  }
}
*/

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';

class ControllyLair extends StatefulWidget {
  const ControllyLair({super.key});

  @override
  State<ControllyLair> createState() => ControllyLairState();
}

class ControllyLairState extends State<ControllyLair> {
  late WebViewController _controller;
  final FocusNode _focusNode = FocusNode();

  @override
  void initState() {
    super.initState();
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.landscapeRight,
    ]);

    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..loadRequest(
        Uri.parse('https://raz0red.github.io/webprboom/'),
      );

    // Request focus after a short delay to ensure widget is built
    Future.delayed(const Duration(milliseconds: 500), () {
      _focusNode.requestFocus();
    });
  }

  @override
  void dispose() {
    _focusNode.dispose();
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.landscapeRight,
    ]);
    super.dispose();
  }

  void _handleKeyEvent(KeyEvent event) {
    final key = event.logicalKey;
    final isDown = event is KeyDownEvent;
    final eventType = isDown ? 'keydown' : 'keyup';

    // Map Flutter keys to web key codes
    String? keyCode;
    if (key == LogicalKeyboardKey.arrowUp) keyCode = '38';
    else if (key == LogicalKeyboardKey.arrowDown) keyCode = '40';
    else if (key == LogicalKeyboardKey.arrowLeft) keyCode = '37';
    else if (key == LogicalKeyboardKey.arrowRight) keyCode = '39';
    else if (key == LogicalKeyboardKey.space) keyCode = '32';
    else if (key == LogicalKeyboardKey.enter) keyCode = '13';
    else if (key == LogicalKeyboardKey.escape) keyCode = '27';
    else if (key == LogicalKeyboardKey.controlLeft || key == LogicalKeyboardKey.controlRight) keyCode = '17';
    else if (key == LogicalKeyboardKey.shiftLeft || key == LogicalKeyboardKey.shiftRight) keyCode = '16';
    else if (key == LogicalKeyboardKey.altLeft || key == LogicalKeyboardKey.altRight) keyCode = '18';
    // Letter keys
    else if (key.keyLabel.length == 1) {
      final char = key.keyLabel.toUpperCase();
      if (char.codeUnitAt(0) >= 65 && char.codeUnitAt(0) <= 90) {
        keyCode = char.codeUnitAt(0).toString();
      }
    }

    if (keyCode != null) {
      // Inject keyboard event into WebView
      _controller.runJavaScript('''
        (function() {
          var event = new KeyboardEvent('$eventType', {
            keyCode: $keyCode,
            which: $keyCode,
            bubbles: true,
            cancelable: true
          });
          document.dispatchEvent(event);
        })();
      ''');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Focus(
        focusNode: _focusNode,
        autofocus: true,
        onKeyEvent: (node, event) {
          _handleKeyEvent(event);
          return KeyEventResult.handled;
        },
        child: GestureDetector(
          onTap: () {
            // Keep focus when tapping the screen
            _focusNode.requestFocus();
          },
          child: WebViewWidget(controller: _controller),
        ),
      ),
    );
  }
}