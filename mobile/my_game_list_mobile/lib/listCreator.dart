import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class UserGame {
  final int id;
  final String name;
  final String? coverUrl; // backend returns "coverUrl"
  final String status;

  UserGame({
    required this.id,
    required this.name,
    this.coverUrl,
    required this.status,
  });

  factory UserGame.fromJson(Map<String, dynamic> json) {
    return UserGame(
      id: json['id'],
      name: json['name'],
      coverUrl: json['coverUrl'], // NOTICE: updated field name
      status: json['status'],
    );
  }
}

class ListCreator extends StatefulWidget {
  const ListCreator({super.key});

  @override
  State<ListCreator> createState() => ListCreatorState();
}

class ListCreatorState extends State<ListCreator> {
  List<UserGame> _userGames = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchUserGames();
  }

  Future<void> _fetchUserGames() async {
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
        Uri.parse('https://playedit.games/api/user/games'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final games = data['games'] as List<dynamic>;

        setState(() {
          _userGames = games.map((json) => UserGame.fromJson(json)).toList();
        });
      } else {
        setState(() {
          _error = 'Failed to load games (HTTP ${response.statusCode})';
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

  Future<void> _removeGame(int gameId, String gameName) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');

    if (token == null) return;

    // Confirmation dialog
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Remove Game'),
        content: Text('Remove "$gameName" from your list?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text(
              'Remove',
              style: TextStyle(color: Colors.red),
            ),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    try {
      final response = await http.delete(
        Uri.parse('https://playedit.games/api/user/games/$gameId'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        // Refresh list
        _fetchUserGames();

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Removed "$gameName"')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to remove game')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          AppBar(
            backgroundColor: Colors.transparent,
            automaticallyImplyLeading: true,
          ),
          const SizedBox(height: 30),

          // --- TITLE ---
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
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                "Your Games",
                style: TextStyle(
                  color: Colors.deepPurpleAccent,
                  shadows: [
                    Shadow(
                      blurRadius: 12,
                      color: Colors.white,
                      offset: Offset(0, 0),
                    )
                  ],
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),

          const SizedBox(height: 20),

          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _error != null
                    ? Center(child: Text(_error!))
                    : _userGames.isEmpty
                        ? const Center(child: Text('No games in your list yet.'))
                        : ListView.builder(
                            padding: const EdgeInsets.all(16.0),
                            itemCount: _userGames.length,
                            itemBuilder: (context, index) {
                              final game = _userGames[index];

                              return Card(
                                margin: const EdgeInsets.only(bottom: 12.0),
                                child: ListTile(
                                  leading: game.coverUrl != null
                                      ? Image.network(
                                          game.coverUrl!,
                                          width: 50,
                                          fit: BoxFit.cover,
                                        )
                                      : const Icon(Icons.videogame_asset, size: 50),
                                  title: Text(
                                    game.name,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  subtitle: Text('Status: ${game.status}'),
                                  trailing: IconButton(
                                    icon: const Icon(Icons.delete, color: Colors.red),
                                    onPressed: () =>
                                        _removeGame(game.id, game.name),
                                  ),
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
