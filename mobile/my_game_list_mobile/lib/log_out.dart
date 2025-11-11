import 'package:flutter/material.dart';


class LogOut extends StatefulWidget{
  const LogOut({super.key});

  @override
  State<LogOut> createState() => LogOutState();
}

class LogOutState extends State<LogOut>{
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Text(
            "Log Out Here",
            style: TextStyle(
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}