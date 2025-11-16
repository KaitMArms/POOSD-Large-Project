import 'package:flutter/material.dart';
//import 'package:my_game_list_mobile/services/api_service.dart';

class AllGames extends StatefulWidget {
  const AllGames({super.key});

  @override
  State<AllGames> createState() => AllGamesState();
}

class AllGamesState extends State<AllGames>{
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          children: [
            AppBar(
                  automaticallyImplyLeading: false,
                  backgroundColor: Colors.transparent,
                ),

            Container(
              padding: EdgeInsets.symmetric(vertical: 16, horizontal: 32), // bigger box
              
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primaryContainer,
                borderRadius: BorderRadius.circular(16), 
                boxShadow: [
                  BoxShadow(
                    color: Colors.purpleAccent.withValues(alpha: 0.2),
                    offset: Offset(0, 2),
                    blurRadius: 24,
                  ),
                ],
              ),

              child: Stack(
                  children: [
                    Text(
                      "Global Games",
                      style: TextStyle(
                        color: Colors.deepPurpleAccent,
                        fontSize: 36,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  
                    Text(
                      "Global Games",
                      style: TextStyle(
                        foreground: Paint() 
                        ..style = PaintingStyle.stroke
                        ..strokeWidth = 3
                        ..color = Colors.white,
                        decorationColor: Colors.purple,
                        decorationThickness: 2,
                        fontSize: 36,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  
                    Text(
                      "Global Games",
                      style: TextStyle(
                        color: Colors.deepPurpleAccent,
                        shadows: 
                        [
                          Shadow(
                            blurRadius: 12, 
                            color: Colors.white, 
                            offset: Offset(0, 0))
                        ],
                        fontSize: 36,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
              
                  ],
              ),
            ),
          ],
        )
      ),
    );
  }
}

