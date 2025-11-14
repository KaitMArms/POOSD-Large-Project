import 'package:flutter/material.dart';
import 'package:my_game_list_mobile/services/api_service.dart';

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
        child: Text("das wassup"),
      ),
    );
  }
}

