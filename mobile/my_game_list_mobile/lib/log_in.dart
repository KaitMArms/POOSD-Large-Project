
import 'package:flutter/material.dart';

class LogIn extends StatefulWidget {
  const LogIn({super.key, required String title});

  @override
  State<LogIn> createState() => LogInUI();

}

class LogInUI extends State<LogIn>  {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: ConstrainedBox(
          constraints: BoxConstraints(maxWidth: 400),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
              mainAxisSize: MainAxisSize.max,
              children: [
                TextField(
                  decoration: InputDecoration(
                    labelText: "Name"
                  ), 
                ),
                SizedBox(height: 16,),

                TextField(
                  decoration: InputDecoration(
                    labelText: "Email"
                  ), 
                ),
                SizedBox(height: 16,),

                TextField(
                  decoration: InputDecoration(
                    labelText: "Username"
                  ), 
                ),
                SizedBox(height: 16,),

                TextField(
                  decoration: InputDecoration(
                    labelText: "Password"
                  ), 
                ),
              ],
            )
          )
        ),
      );
  }
}