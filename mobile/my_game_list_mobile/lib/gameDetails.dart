import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class GameDetails extends StatefulWidget {
  final int gameId;
  final String gameName;

  const GameDetails({
    super.key,
    required this.gameId,
    required this.gameName,
  });

  @override
  State<GameDetails> createState() => _GameDetailsState();
}

class _GameDetailsState extends State<GameDetails> {
  Map<String, dynamic>? _gameData;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchGameDetails();
  }

  Future<void> _fetchGameDetails() async {
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
        Uri.parse('https://playedit.games/api/globalgames/${widget.gameId}'),
        headers: <String, String>{
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        setState(() {
          _gameData = jsonDecode(response.body);
        });
      } else {
        setState(() {
          _error = 'Failed to load game details: ${response.statusCode}';
        });
      }
    } catch (e) {
      setState(() {
        _error = 'Error fetching game details: $e';
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
      appBar: AppBar(
        title: Text(widget.gameName),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(32.0),
                    child: Text(
                      _error!,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                )
              : _buildGameDetails(),
    );
  }

  Widget _buildGameDetails() {
    if (_gameData == null) return const SizedBox();

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Banner/Artwork Image
          if (_gameData!['bannerUrl'] != null)
            Image.network(
              _gameData!['bannerUrl'],
              width: double.infinity,
              height: 250,
              fit: BoxFit.cover,
            ),

          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Game Title
                Text(
                  _gameData!['name'] ?? 'Unknown Game',
                  style: const TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),

                // Cover Image + Info Row
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Cover Image
                    if (_gameData!['coverUrl'] != null)
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.network(
                          _gameData!['coverUrl'],
                          width: 120,
                          height: 160,
                          fit: BoxFit.cover,
                        ),
                      ),
                    const SizedBox(width: 16),

                    // Quick Info
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (_gameData!['first_release_date'] != null)
                            _buildInfoRow(
                              'Release Date',
                              _formatDate(_gameData!['first_release_date']),
                            ),
                          if (_gameData!['userRating'] != null)
                            _buildInfoRow(
                              'Rating',
                              '${_gameData!['userRating'].toStringAsFixed(1)}/100',
                            ),
                          if (_gameData!['franchise'] != null)
                            _buildInfoRow(
                              'Franchise',
                              _gameData!['franchise'],
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Genres
                if (_gameData!['genres'] != null &&
                    (_gameData!['genres'] as List).isNotEmpty)
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Genres',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: (_gameData!['genres'] as List)
                            .map((genre) => Chip(
                                  label: Text(genre),
                                  backgroundColor: Theme.of(context)
                                      .colorScheme
                                      .primaryContainer,
                                ))
                            .toList(),
                      ),
                      const SizedBox(height: 16),
                    ],
                  ),

                // Platforms
                if (_gameData!['platforms'] != null &&
                    (_gameData!['platforms'] as List).isNotEmpty)
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Platforms',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: (_gameData!['platforms'] as List)
                            .map((platform) => Chip(
                                  label: Text(platform),
                                ))
                            .toList(),
                      ),
                      const SizedBox(height: 16),
                    ],
                  ),

                // Summary
                if (_gameData!['summary'] != null)
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Summary',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _gameData!['summary'],
                        style: const TextStyle(fontSize: 16),
                      ),
                      const SizedBox(height: 16),
                    ],
                  ),

                // Storyline
                if (_gameData!['storyline'] != null)
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Storyline',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _gameData!['storyline'],
                        style: const TextStyle(fontSize: 16),
                      ),
                      const SizedBox(height: 16),
                    ],
                  ),

                // Languages
                if (_gameData!['languages'] != null &&
                    (_gameData!['languages'] as List).isNotEmpty)
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Languages',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        (_gameData!['languages'] as List).join(', '),
                        style: const TextStyle(fontSize: 16),
                      ),
                    ],
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[600],
              fontWeight: FontWeight.w500,
            ),
          ),
          Text(
            value,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(dynamic timestamp) {
    if (timestamp == null) return 'N/A';
    try {
      final date = DateTime.fromMillisecondsSinceEpoch(timestamp * 1000);
      return '${date.month}/${date.day}/${date.year}';
    } catch (e) {
      return 'N/A';
    }
  }
}