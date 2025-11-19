import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
//import 'package:my_game_list_mobile/services/api_service.dart';

class Game {
  final int id;
  final String name;
  final String? coverUrl;

  Game({required this.id, required this.name, this.coverUrl});

  factory Game.fromJson(Map<String, dynamic> json) {
    return Game(
      id: json['id'],
      name: json['name'],
      coverUrl: json['coverUrl'],
    );
  }
}

class AllGames extends StatefulWidget {
  const AllGames({super.key});

  @override
  State<AllGames> createState() => AllGamesState();
}

class AllGamesState extends State<AllGames> {
  List<Game> _games = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchGlobalGames();
  }

  Future<void> _fetchGlobalGames() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');

    if (token == null) {
      setState(() {
        _error = 'You are not logged in.';
        _loading = false;
      });
      return;
    }

    try {
      final response = await http.get(
        Uri.parse('https://playedit.games/api/globalgames/browse/recommended'),
        headers: <String, String>{
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        final List<dynamic> gamesJson = responseData['recommendations'];

        if(gamesJson.isEmpty)
        {
            setState(() {
            _games = [];
            _error = 'No recommendations yet. Add some games to your list first!';
          });
          
          return;
        }

        setState(() {
            _games = gamesJson
            .map((rec) => Game.fromJson(rec['game'] as Map<String, dynamic>)) // ← Extract 'game'
            .toList();
        });
      } else {
        setState(() {
          _error = 'Failed to load games: ${response.statusCode}';
        });
      }
    } catch (e) {
      setState(() {
        _error = 'Error fetching games: $e';
      });
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
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
                  color: Colors.purpleAccent.withOpacity(0.2),
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
                    shadows: [
                      Shadow(
                        blurRadius: 12,
                        color: Colors.white,
                        offset: Offset(0, 0),
                      ),
                    ],
                    fontSize: 36,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
          if (_loading)
            const CircularProgressIndicator()
          else if (_error != null)
            Flexible(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(32.0, 0.0, 32.0, 32.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Text(
                      _error!,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            )
          else
            Expanded(
              child: GridView.builder(
                padding: const EdgeInsets.all(16.0),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 16.0,
                  mainAxisSpacing: 16.0,
                  childAspectRatio: 0.7,
                ),
                itemCount: _games.length,
                itemBuilder: (context, index) {
                  final game = _games[index];
                  return Card(
                    elevation: 4.0,
                    child: Column(
                      children: [
                        if (game.coverUrl != null)
                          Expanded(
                            child: Image.network(
                              game.coverUrl!,
                              fit: BoxFit.cover,
                              width: double.infinity,
                            ),
                          ),
                        Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: Text(
                            game.name,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              fontSize: 16.0,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
        ],
      ),
    );
  }
}

