import 'package:flutter/material.dart';

class ListCreator extends StatefulWidget {
  const ListCreator({super.key});

  @override
  State<ListCreator> createState() => ListCreatorState();

}

class ListCreatorState extends State<ListCreator>  {
  
  @override
  Widget build(BuildContext context) { 
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
                    "Your Games",
                    style: TextStyle(
                      color: Colors.deepPurpleAccent,
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                
                  Text(
                    "Your Games",
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
                    "Your Games",
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

              SizedBox(height: 30),

              Text(
                      "Your Games",
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold
                      ),
                    ),

              Padding(
                padding: const EdgeInsets.all(8.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                  
                  ],
                ),
              ),

              SizedBox(height: 30),

              Text("Add New Games Here",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold
                      ),
                    ),

              Padding(
                padding: const EdgeInsets.all(8.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    
                  ],
                ),
              )
            ],
          ),
        ),
      )
    );
  }
}