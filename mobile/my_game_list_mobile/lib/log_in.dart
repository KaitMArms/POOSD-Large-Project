import 'package:flutter/material.dart';
import 'package:my_game_list_mobile/profile.dart';
import 'package:my_game_list_mobile/sign_up.dart';

class LogIn extends StatefulWidget {
  const LogIn({super.key});

  @override
  State<LogIn> createState() => _LogInState();

}

class _LogInState extends State<LogIn>{
  final TextEditingController username = TextEditingController();
  final TextEditingController password = TextEditingController();
  bool _obscure = true;
  
  @override
  void dispose() {
    username.dispose();
    password.dispose();
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFF192642),
      body: Padding(
      padding: EdgeInsets.fromLTRB(24, 40, 24, 24),
      child: Center(
          child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            TextField(
              controller: username,
              decoration: InputDecoration(
                border: OutlineInputBorder(),
                labelText: "Username/Email",
                fillColor: Color(0xFF2047C0),
                filled: true,
              )
            ),

            SizedBox(height: 20),

            TextField(
              controller: password,
              obscureText: _obscure,
              decoration: InputDecoration(
                border: OutlineInputBorder(),
                labelText: "Password",
                fillColor: Color(0xFF2047C0),
                filled: true,
                suffixIcon: IconButton(
                    icon: Icon(_obscure ? Icons.visibility : Icons.visibility_off),
                    onPressed: (){
                      setState(() {
                        _obscure = !_obscure;
                      });
                    },
                  ),
                ),
            ),

            SizedBox(height: 20),

            ElevatedButton(
              onPressed: () {
                Navigator.push(context, 
                    MaterialPageRoute(builder: (context) => const SignUp())
                    );
              },
              child: Text("Sign Up"),
            ),

            SizedBox(height: 14),

            ElevatedButton(
              onPressed: () {
                Navigator.push(context, 
                    MaterialPageRoute(builder: (context) => const Profile())
                    );
              },
              child: Text("Log In"),
            )
          ],
        )
      )
      )
    );
  }
}



  /*final TextEditingController username = TextEditingController();
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        padding: EdgeInsets.fromLTRB(24, 80, 24, 24),
          child: Column(
          children: [

            TextField(
              decoration: InputDecoration(
                border: OutlineInputBorder(),
                labelText: "Username/Email",
                fillColor: Color.fromARGB(3, 6, 16, 245),
              )
            ),

            SizedBox(height: 16),

            TextField(
              decoration: InputDecoration(
                border: OutlineInputBorder(),
                labelText: "Password",
                fillColor: Color.fromARGB(3, 6, 16, 245),
                )
            ),

            SizedBox(height: 16),

            ElevatedButton(
              onPressed: () {
                Navigator.push(context, 
                    MaterialPageRoute(builder: (context) => const SignUp())
                    );
              },
              child: Text("Log In"),
            )
          ],
        )
      )
    );
  }
}*/

