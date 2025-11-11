import 'package:flutter/material.dart';
import 'package:my_game_list_mobile/main_navigation.dart';
import 'package:my_game_list_mobile/password_collect.dart';
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
      body: Padding(
      padding: EdgeInsets.fromLTRB(24, 0, 24, 24),
      child: Center(
          child: ListView(
            shrinkWrap: true,
            physics: AlwaysScrollableScrollPhysics(),
          //mainAxisAlignment: MainAxisAlignment.center,
          //crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Image(
              image: AssetImage('assets/Mascot.png'),
              fit: BoxFit.cover,
            ),

            SizedBox(height: 30),

            TextField(
              controller: username,
              decoration: InputDecoration(
                border: OutlineInputBorder(),
                labelText: "Username",
              )
            ),

            SizedBox(height: 20),

            TextField(
              controller: password,
              obscureText: _obscure,
              decoration: InputDecoration(
                border: OutlineInputBorder(),
                labelText: "Password",
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
                    MaterialPageRoute(builder: (context) => const MainNavigation())
                    );
              },
              child: Text("Log In"),
            ),

            SizedBox(height: 14),

            ElevatedButton(
              onPressed: () {
                Navigator.push(context, 
                    MaterialPageRoute(builder: (context) => const PasswordCollect())
                    );
              },
              child: Text("Forgot Your Password?"),
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

