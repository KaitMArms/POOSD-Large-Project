import 'package:flutter/material.dart';
//import 'dart:async';

import 'package:my_game_list_mobile/new_password_setup.dart';
//import 'package:my_game_list_mobile/log_in.dart';


class PasswordCollect extends StatefulWidget {
  const PasswordCollect({super.key});

  @override
  State<PasswordCollect> createState() => _PasswordCollect();
}

class _PasswordCollect extends State<PasswordCollect>{
  int pressCount = 0;
  int countdownTimer = 10;
  String eMail = "Send E-Mail Code";
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        //make non-arbitrary, looks good but appears different on everyphone due to it being an assigned value
        padding: EdgeInsets.fromLTRB(24, 40, 24, 24),
        child: Center(
          //constraints: BoxConstraints(maxWidth: 400),
          child: ListView(
            children: [

              Text(
                textAlign: TextAlign.center,
                "Forgot your password?\n\nEnter your email, type in the code we sent you below, and you can create a new password guaranteed.*",
                style: TextStyle(fontSize: 16),
              ),

              SizedBox(height: 20),

              TextField(
                decoration: InputDecoration(
                  labelText: "Email"

                ),
              ),
              
              SizedBox(height: 20),

              ElevatedButton(onPressed: () {
                setState(() {
                  pressCount++;
                });

                if(pressCount > 0){
                  eMail = "Resend E-Mail Code";
                } 
              },
                child: Text(eMail),
              ),

              SizedBox(height: 10),

              ElevatedButton(
                onPressed: () {
                  //check with an if statement if the submitted code is the correct one 
                  Navigator.push(context, 
                    MaterialPageRoute(builder: (context) => const NewPass())
                    );
                }, 
                child: Text("Submit Code"),
              ),

              SizedBox(height: 20),

              Text(
                textAlign: TextAlign.center,
                "*Note: Guarantee of password functionality is only valid for 3 epochal infinities. After this, please advise your password to seek therapeutical services for feelings of loss, existential ennui, and if Interstellar was actually accurate.",
                style: TextStyle(fontSize: 12),
              ),

            ],
          ),
        ),
      ),
    );
  }
}