import 'package:flutter/material.dart';

class AddGames extends StatefulWidget {
  const AddGames({super.key});

  @override
  State<AddGames> createState() => AddGamesState();

}

class AddGamesState extends State<AddGames>  {
  
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
                    "Add New Game",
                    style: TextStyle(
                      color: Colors.deepPurpleAccent,
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                
                  Text(
                    "Add New Game",
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
                    "Add New Game",
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