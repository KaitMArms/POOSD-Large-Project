import 'package:flutter/material.dart';
import 'package:my_game_list_mobile/controlly.dart';

class Secretdoor extends StatefulWidget {
  const Secretdoor({super.key});

  @override
  State<Secretdoor> createState() => SecretdoorState();
}

class SecretdoorState extends State<Secretdoor> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: true,
        backgroundColor: Colors.transparent,
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(32.0, 0, 32.0, 16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Text(
                "THE SEEEEEEEEEECRRRRREEEEETTTTT DOOR.",
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold
                ),
              ),

              SizedBox(height: 20),

              ElevatedButton(onPressed: () {
                Navigator.push(context, MaterialPageRoute(builder: (context) => ControllyLair())
                );
              }, 
              child: Text(
                "Walk in?",
                style: TextStyle(
                  fontStyle: FontStyle.italic,
                  fontWeight: FontWeight.bold
                ),
              )
              )
            ],
          ),
        ),
      ),
    );
  }
  
}