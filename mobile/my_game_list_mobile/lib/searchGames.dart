import 'package:flutter/material.dart';
import 'package:my_game_list_mobile/browse.dart';

class searchGames extends StatefulWidget {
  const searchGames({super.key});

  @override
  State<searchGames> createState() => searchGamesState();

}

class searchGamesState extends State<searchGames>  {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: 
        Center(
          child: 
          Text(
            'Search Games Page\n(Coming Really Soon)',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 24),
          ),
        ),
    );
  }
}