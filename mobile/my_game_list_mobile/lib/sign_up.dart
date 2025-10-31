
import 'package:flutter/material.dart';

class SignUp extends StatefulWidget {
  const SignUp({super.key});

  @override
  State<SignUp> createState() => SignUpUI();

}

class SignUpUI extends State<SignUp>  {
  /*
  we need to make something that:
  1. Moves the text boxes slightly down
  2. Puts the text fields in mild boxes instead
  3. First name, last name text boxes too
  */

  bool _obscure = true;

  final TextEditingController firstName = TextEditingController();
  final TextEditingController lastName = TextEditingController();
  final TextEditingController username = TextEditingController();
  final TextEditingController password = TextEditingController();
  final TextEditingController email = TextEditingController();
  
  @override
  void dispose() {
    firstName.dispose();
    lastName.dispose();
    username.dispose();
    password.dispose();
    email.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    
    return Scaffold(
      body: SingleChildScrollView(
        padding: EdgeInsets.fromLTRB(24, 90, 24, 24),
        child: ConstrainedBox(
          constraints: BoxConstraints(maxWidth: 400),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
              mainAxisSize: MainAxisSize.max,
              children: [

                Text("Welcome to PlayedIt!\nInsert your information below to join our ranks.", 
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    fontStyle: FontStyle.italic,
                    color: Colors.deepPurpleAccent,
                  ),
                ),
                SizedBox(height: 50,),

                TextField(
                  controller: firstName,
                  decoration: InputDecoration(
                    filled: true,
                    labelText: "First Name",
                    border: OutlineInputBorder(),
                  ), 
                ),
                SizedBox(height: 16,),

                TextField(
                  controller: lastName,
                  decoration: InputDecoration(
                    filled: true,
                    labelText: "Last Name",
                    border: OutlineInputBorder(),
                  ), 
                ),
                SizedBox(height: 16,),

                TextField(
                  controller: email,
                  decoration: InputDecoration(
                    filled: true,
                    labelText: "Email",
                    border: OutlineInputBorder(),
                  ), 
                ),
                SizedBox(height: 16,),

                TextField(
                  controller: username,
                  decoration: InputDecoration(
                    filled: true,
                    labelText: "Username",
                    border: OutlineInputBorder(),
                  ), 
                ),
                SizedBox(height: 16,),

                TextField(
                  controller: password,
                  obscureText: _obscure,
                  decoration: InputDecoration(
                    filled: true,
                    labelText: "Password",
                    border: OutlineInputBorder(),
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
                SizedBox(height: 16,),
                ElevatedButton(
                  onPressed: () {
                    //NavigationBar to sign_up.dart
                    Navigator.pop(context);
                  }, 
                  child: Text("Back to Log-In"))
              ],
            )
          )
        ),
      );
  }
}