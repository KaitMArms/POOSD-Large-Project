import 'package:flutter/material.dart';

class Secretdoor extends StatefulWidget {
  const Secretdoor({super.key});

  @override
  State<Secretdoor> createState() => SecretdoorState();
}

class SecretdoorState extends State<Secretdoor> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Text(
                "SEEEEEEEEEECRRRRREEEEETTTTT DDDDOOOOOOOOOOOOOOOOOOOOOORRRR.\n\nPatent Denied",
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
  
}