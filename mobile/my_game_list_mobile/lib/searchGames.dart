import 'package:flutter/material.dart';
import 'package:material_design_icons_flutter/material_design_icons_flutter.dart';
import 'package:my_game_list_mobile/browse.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class searchGames extends StatefulWidget {
  const searchGames({super.key});

  @override
  State<searchGames> createState() => searchGamesState();
}

class searchGamesState extends State<searchGames> {
  List<Game> _searchResults = [];
  bool _loading = false;
  String? _error;
  final TextEditingController _searchController = TextEditingController();
  bool _hasSearched = false;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _searchGames(String query) async {
    if (query.trim().isEmpty) {
      setState(() {
        _searchResults = [];
        _error = null;
        _hasSearched = false;
      });
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
      _hasSearched = true;
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
        Uri.parse('https://playedit.games/api/globalgames/search?q=${Uri.encodeComponent(query)}'),
        headers: <String, String>{
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        final List<dynamic> gamesJson = responseData['data'];

        setState(() {
          _searchResults = gamesJson
              .map((gameJson) => Game.fromJson(gameJson as Map<String, dynamic>))
              .toList();
          
          if (_searchResults.isEmpty) {
            _error = 'No games found for "$query"';
          }
        });
      } else {
        setState(() {
          _error = 'Failed to search games: ${response.statusCode}';
        });
      }
    } catch (e) {
      setState(() {
        _error = 'Error searching games: $e';
      });
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(32.0, 0, 32, 0),
      child: Column(
        children: [
          SearchBar(
            controller: _searchController,
            leading: Icon(MdiIcons.searchWeb),
            hintText: "Search Global Games",
            onSubmitted: (value) => _searchGames(value),
            trailing: [
              if (_searchController.text.isNotEmpty)
                IconButton(
                  icon: Icon(Icons.clear),
                  onPressed: () {
                    _searchController.clear();
                    setState(() {
                      _searchResults = [];
                      _error = null;
                      _hasSearched = false;
                    });
                  },
                ),
            ],
          ),
          const SizedBox(height: 20),
          Expanded(
            child: _buildSearchContent(),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchContent() {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return Center(
        child: Text(
          _error!,
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
      );
    }

    if (!_hasSearched) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              MdiIcons.gamepadVariant,
              size: 64,
              color: Colors.grey,
            ),
            const SizedBox(height: 16),
            Text(
              'Search for games from our global database',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 18,
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
      );
    }

    return GridView.builder(
      padding: const EdgeInsets.all(16.0),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 16.0,
        mainAxisSpacing: 16.0,
        childAspectRatio: 0.7,
      ),
      itemCount: _searchResults.length,
      itemBuilder: (context, index) {
        final game = _searchResults[index];
        return Card(
          elevation: 4.0,
          child: Column(
            children: [
              if (game.coverUrl != null)
                Expanded(
                  child: Image.network(
                    game.coverUrl!,
                    fit: BoxFit.contain,
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
    );
  }
}