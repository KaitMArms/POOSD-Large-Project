import 'package:flutter/material.dart';
import 'package:my_game_list_mobile/main_navigation.dart';
import 'package:my_game_list_mobile/profile.dart';
import 'package:my_game_list_mobile/services/api_service.dart';
import 'package:my_game_list_mobile/sign_up.dart';
import 'package:http/http.dart' as http;

class LogInIdea extends StatefulWidget {
  const LogInIdea({super.key});

  @override
  State<LogInIdea> createState() => _LogInTestState();
}

class _LogInTestState extends State<LogInIdea> {
  final TextEditingController email = TextEditingController();
  final TextEditingController password = TextEditingController();
  bool _obscure = true;
  bool _isLoading = false;
  bool isHoveringSignUp = false;
  bool isHoveringPassword = false;

  @override
  void dispose() {
    email.dispose();
    password.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final result = await ApiService.login(email.text, password.text);
      // Navigate to the main navigation on success
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const MainNavigation()),
      );
    } catch (e) {
      // Show error message
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: Padding(
            padding: EdgeInsets.fromLTRB(24, MediaQuery.of(context).size.height * 0.025, 24, 24),
            child: SingleChildScrollView(
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    ListView(
                    shrinkWrap: true,
                    physics: AlwaysScrollableScrollPhysics(),
                    children: [
                      ConstrainedBox(
                        constraints: BoxConstraints(
                          maxWidth: 150,
                          maxHeight: 150,
                        ),
                        child: Image(
                          image: AssetImage('assets/Mascot.png'),
                          fit: BoxFit.contain,
                        ),
                      ),
                      Stack(
                          alignment: Alignment.center,
                          children: [
                            Text(
                              "Welcome Back to PlayedIt!",
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 35,
                                fontWeight: FontWeight.bold,
                                foreground: Paint()
                                  ..style = PaintingStyle.stroke
                                  ..strokeWidth = 3
                                  ..color = Colors.white,
                              ),
                            ),
                            Text(
                              "Welcome Back to PlayedIt!",
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 35,
                                color: Colors.deepPurpleAccent,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text("Welcome Back to PlayedIt!",
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                    fontSize: 35,
                                    color: Colors.deepPurpleAccent,
                                    fontWeight: FontWeight.bold,
                                    shadows: [
                                      Shadow(
                                          blurRadius: 8,
                                          color: Colors.white,
                                          offset: Offset(0, 0)),
                                      Shadow(
                                          blurRadius: 8,
                                          color: Colors.white,
                                          offset: Offset(0, 0)),
                                    ]))
                          ]),
                      SizedBox(height: 30),
                      TextField(
                          controller: email,
                          decoration: InputDecoration(
                            labelText: "Email",
                          )),
                      SizedBox(height: 20),
                      TextField(
                        controller: password,
                        obscureText: _obscure,
                        decoration: InputDecoration(
                          labelText: "Password",
                          suffixIcon: IconButton(
                            icon: Icon(
                                _obscure ? Icons.visibility : Icons.visibility_off),
                            onPressed: () {
                              setState(() {
                                _obscure = !_obscure;
                              });
                            },
                          ),
                        ),
                      ),
                      SizedBox(height: 20),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 30),
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                              backgroundColor: Color(0xFF2047C0),
                              side: BorderSide(
                                color: Colors.deepPurpleAccent,
                                width: 4,
                              )),
                          onPressed: _isLoading ? null : _login,
                          child: _isLoading
                              ? const CircularProgressIndicator()
                              : const Text(
                                  "Log In",
                                  style: TextStyle(
                                    color: Colors.white,
                                  ),
                                ),
                        ),
                      ),
                      SizedBox(height: 25),
                      GestureDetector(
                        onTapDown: (_) => setState(() => isHoveringSignUp = true),
                        onTapUp: (_) => setState(() => isHoveringSignUp = false),
                        onTapCancel: () =>
                            setState(() => isHoveringSignUp = false),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Text(
                              textAlign: TextAlign.center,
                              "New to PlayedIt?",
                              style: TextStyle(
                                fontSize: 18,
                              ),
                            ),
                            TextButton(
                              style: TextButton.styleFrom(
                                textStyle: TextStyle(fontSize: 18),
                                padding: EdgeInsets
                                    .zero, // removes the default vertical padding
                                minimumSize: Size(
                                    0, 0), // avoids minimum touch size forcing space
                                tapTargetSize: MaterialTapTargetSize
                                    .shrinkWrap, // ensures minimal layout space
                              ),
                              onPressed: () {
                                Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                        builder: (context) => const SignUp()));
                              },
                              child: Stack(children: [
                                Text(
                                  "Sign Up!",
                                  style: TextStyle(
                                      foreground: Paint()
                                        ..style = PaintingStyle.stroke
                                        ..strokeWidth = 3
                                        ..color = isHoveringSignUp
                                            ? Colors.purple
                                            : Colors.white,
                                      fontWeight: FontWeight.bold,
                                      decoration: isHoveringSignUp
                                          ? TextDecoration.underline
                                          : TextDecoration.none,
                                      decorationColor: Colors.purple,
                                      decorationThickness: 2),
                                  textAlign: TextAlign.center,
                                ),
                                Text(
                                  "Sign Up!",
                                  style: TextStyle(
                                      color: Colors.deepPurpleAccent,
                                      fontWeight: FontWeight.bold),
                                  textAlign: TextAlign.center,
                                ),
                                Text(
                                  "Sign Up!",
                                  style: TextStyle(
                                      fontSize: 18,
                                      color: Colors.deepPurpleAccent,
                                      fontWeight: FontWeight.bold,
                                      shadows: [
                                        if (!isHoveringSignUp)
                                          Shadow(
                                              blurRadius: 12,
                                              color: Colors.white,
                                              offset: Offset(0, 0))
                                        else
                                          Shadow(
                                              blurRadius: 12,
                                              color: Colors.purple,
                                              offset: Offset(0, 0)),
                                        Shadow(
                                            blurRadius: 16,
                                            color: Colors.white,
                                            offset: Offset(0, 0)),
                                      ]),
                                ),
                              ]),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(height: 10),
                    ],
                                  ),
                  ],
                )),
            )));
  }
}
