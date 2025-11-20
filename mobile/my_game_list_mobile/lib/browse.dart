import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:my_game_list_mobile/searchGames.dart';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:my_game_list_mobile/recommendedGames.dart';
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
  final PageController _pageController = PageController();

  @override
  void initState() {
    super.initState();
    _fetchGlobalGames();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  // ========== YOUR EXISTING API LOGIC - UNTOUCHED ==========
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
            .map((rec) => Game.fromJson(rec['game'] as Map<String, dynamic>))
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
  // ========== END OF API LOGIC ==========

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          AppBar(
            automaticallyImplyLeading: false,
            backgroundColor: Colors.transparent,
            foregroundColor: Colors.transparent,
          ),
          Container(
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 32),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primaryContainer,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.purpleAccent.withValues(alpha: 0.2),
                  offset: const Offset(0, 2),
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
          const SizedBox(height: 20),
          // NEW: PageView with your two tabs
          Expanded(
            child: PageView(
              controller: _pageController,
              children: [
                // Page 1: Recommended Games (your existing grid)
                RecommendedGames(
                  games: _games,
                  loading: _loading,
                  error: _error,
                ),
                // Page 2: Search Games (placeholder for now)
                searchGames(),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
