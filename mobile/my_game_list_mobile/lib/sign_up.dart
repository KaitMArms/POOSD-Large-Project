
import 'package:flutter/material.dart';

import 'package:my_game_list_mobile/services/api_service.dart';



class SignUp extends StatefulWidget {

  const SignUp({super.key});



  @override

  State<SignUp> createState() => SignUpUI();

}



class SignUpUI extends State<SignUp> {

  /*

  we need to make something that:

  1. Moves the text boxes slightly down

  2. Puts the text fields in mild boxes instead

  3. First name, last name text boxes too

  */



  bool _obscure = true;

  bool _isLoading = false;



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



  Future<void> _register() async {

    setState(() {

      _isLoading = true;

    });



    try {

      final userData = {

        'firstName': firstName.text,

        'lastName': lastName.text,

        'email': email.text,

        'username': username.text,

        'password': password.text,

      };

      await ApiService.register(userData);

      // Navigate to the login page on success

      Navigator.pop(context);

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

          //make non-arbitrary, looks good but appears different on everyphone due to it being an assigned value

          padding: EdgeInsets.fromLTRB(24, 60, 24, 24),

          child: Center(

              //constraints: BoxConstraints(maxWidth: 400),

              child: ListView(

            //crossAxisAlignment: CrossAxisAlignment.stretch,

            //mainAxisSize: MainAxisSize.max,

            children: [

              Text(

                "Welcome to PlayedIt!\nInsert your information below to join our ranks.",

                textAlign: TextAlign.center,

                style: TextStyle(

                  fontSize: 20,

                  fontWeight: FontWeight.bold,

                  fontStyle: FontStyle.italic,

                  color: Colors.deepPurpleAccent,

                ),

              ),

              SizedBox(

                height: 40,

              ),

              TextField(

                controller: firstName,

                decoration: InputDecoration(

                  filled: true,

                  labelText: "First Name",

                  border: OutlineInputBorder(),

                ),

              ),

              SizedBox(

                height: 16,

              ),

              TextField(

                controller: lastName,

                decoration: InputDecoration(

                  filled: true,

                  labelText: "Last Name",

                  border: OutlineInputBorder(),

                ),

              ),

              SizedBox(

                height: 16,

              ),

              TextField(

                controller: email,

                decoration: InputDecoration(

                  filled: true,

                  labelText: "Email",

                  border: OutlineInputBorder(),

                ),

              ),

              SizedBox(

                height: 16,

              ),

              TextField(

                controller: username,

                decoration: InputDecoration(

                  filled: true,

                  labelText: "Username",

                  border: OutlineInputBorder(),

                ),

              ),

              SizedBox(

                height: 16,

              ),

              TextField(

                controller: password,

                obscureText: _obscure,

                decoration: InputDecoration(

                  filled: true,

                  labelText: "Password",

                  border: OutlineInputBorder(),

                  suffixIcon: IconButton(

                    icon:

                        Icon(_obscure ? Icons.visibility : Icons.visibility_off),

                    onPressed: () {

                      setState(() {

                        _obscure = !_obscure;

                      });

                    },

                  ),

                ),

              ),

              SizedBox(

                height: 16,

              ),

              ElevatedButton(

                onPressed: _isLoading ? null : _register,

                child: _isLoading

                    ? const CircularProgressIndicator()

                    : const Text("Sign Up"),

              ),

              ElevatedButton(

                  onPressed: () {

                    //NavigationBar to sign_up.dart

                    Navigator.pop(context);

                    //Navigator.push(context, )

                  },

                  child: Text("Back to Log-In"))

            ],

          ))),

    );

  }

}