import 'package:flutter/material.dart';
import 'package:my_game_list_mobile/main_navigation.dart';
import 'package:my_game_list_mobile/password_collect.dart';
import 'package:my_game_list_mobile/sign_up.dart';

class LogInIdea extends StatefulWidget {
  const LogInIdea({super.key});

  @override
  State<LogInIdea> createState() => _LogInTestState();

}

class _LogInTestState extends State<LogInIdea>{
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
      child: SingleChildScrollView(
        child: Center(
            child: ListView(
              shrinkWrap: true,
              physics: AlwaysScrollableScrollPhysics(),
            //mainAxisAlignment: MainAxisAlignment.center,
            //crossAxisAlignment: CrossAxisAlignment.center,
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
                        foreground: Paint()
                          ..style = PaintingStyle.stroke
                          ..strokeWidth = 1.84
                          ..color = Colors.white,
                      ),
                  ),
        
                  Text(
                    "Welcome Back to PlayedIt!",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        fontSize: 35,
                        color: Colors.deepPurpleAccent,
                      ),
                  ),
                ]
              ),
              SizedBox(height: 30),
        
              TextField(
                controller: username,
                decoration: InputDecoration(
                  labelText: "Username",
                )
              ),
        
              SizedBox(height: 20),
        
              TextField(
                controller: password,
                obscureText: _obscure,
                decoration: InputDecoration(
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
        
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 30),
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Color(0xFF2047C0),
                    side: BorderSide(
                      color: Colors.deepPurpleAccent,
                      width: 4,
                    )
                  ),
                  onPressed: () {
                    Navigator.push(context, 
                        MaterialPageRoute(builder: (context) => const MainNavigation())
                        );
                  },
                  child: Text(
                    "Log In",
                    style: TextStyle(
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
        
              SizedBox(height: 14),
        
        
              Column(
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
                      padding: EdgeInsets.zero, // removes the default vertical padding
                      minimumSize: Size(0, 0), // avoids minimum touch size forcing space
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap, // ensures minimal layout space
                      textStyle: TextStyle(fontSize: 18),
                    ),
                    onPressed: () {
                      Navigator.push(context, 
                          MaterialPageRoute(builder: (context) => const SignUp())
                          );
                    }, 
                  child: Text(
                    "Sign Up",
                    style: TextStyle(
                      fontSize: 19,
                    ),
                  )),
                ],
              ),
        
              SizedBox(height: 10),
        
              /*TextButton(
                onPressed: () {
                  Navigator.push(context, 
                      MaterialPageRoute(builder: (context) => const PasswordCollect())
                      );
                }, 
                child: Text("Get New Password"))*/
        
                Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Text(
                    textAlign: TextAlign.center,
                    "Forgot Password?",
                    style: TextStyle(
                      fontSize: 18,
                    ),
                  ),
                  TextButton(
                    style: TextButton.styleFrom(
                      textStyle: TextStyle(
                        fontSize: 18
                      ),
                      padding: EdgeInsets.zero, // removes the default vertical padding
                      minimumSize: Size(0, 0), // avoids minimum touch size forcing space
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap, // ensures minimal layout space
                    ),
                    onPressed: () {
                      Navigator.push(context, 
                          MaterialPageRoute(builder: (context) => const PasswordCollect())
                          );
                    }, 
                  child: Text(
                    "Get New One Here!",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      foreground: Paint()
                      ..style = PaintingStyle.stroke
                      ..strokeWidth = 0.5
                      ..color = Colors.white
                      ,
                      fontSize: 18
                    ),
                    )),
                ],
              ),
            ],
          )
        ),
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

