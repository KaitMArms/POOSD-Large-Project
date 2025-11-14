import 'package:flutter/material.dart';

class UserDetails extends StatefulWidget {
  const UserDetails({super.key});

  @override
  State<UserDetails> createState() => UserDetailsState();

}

class UserDetailsState extends State<UserDetails>  {
  
  @override
  Widget build(BuildContext context) {
    // TODO: implement build
    return Scaffold(
      body: SingleChildScrollView(
        child: Center(
          child: Column(
            children: [
              AppBar(
                backgroundColor: Colors.transparent,
                automaticallyImplyLeading: true,
              ),
              SizedBox(height: 30),
              Stack(
                children: [
                  Text(
                    "Edit User Details",
                    style: TextStyle(
                      color: Colors.deepPurpleAccent,
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                
                  Text(
                    "Edit User Details",
                    style: TextStyle(
                      foreground: Paint() 
                      ..style = PaintingStyle.stroke
                      ..strokeWidth = 3
                      ..color = Colors.white,
                      decorationColor: Colors.purple,
                      decorationThickness: 2,
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                
                  Text(
                    "Edit User Details",
                    style: TextStyle(
                      color: Colors.deepPurpleAccent,
                      shadows: 
                      [
                        Shadow(
                          blurRadius: 12, 
                          color: Colors.white, 
                          offset: Offset(0, 0))
                      ],
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),

              
            ],
          ),
        ),
      )
    );
  }
}