import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class UserGame {
  final int id;
  final String name;
  final String? cover;
  final String status;
  final double? userRating;

  UserGame({
    required this.id,
    required this.name,
    this.cover,
    required this.status,
    this.userRating,
  });

  factory UserGame.fromJson(Map<String, dynamic> json) {
    return UserGame(
      id: json['id'],
      name: json['name'],
      cover: json['cover'],
      status: json['status'],
      userRating: (json['userRating'] as num?)?.toDouble(),
    );
  }
}

class YourGamesList extends StatefulWidget {
  const YourGamesList({super.key});

  @override
  State<YourGamesList> createState() => YourGamesListState();
}

class YourGamesListState extends State<YourGamesList> {
  int? touchedIndex;
  List<UserGame> _userGames = [];
  bool _loading = true;
  String? _error;

  Map<String, double> dataMap = {
    "Completed": 0,
    "In Progress": 0,
    "Paused": 0,
    "Dropped": 0,
    "To Be Played": 0
  };

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
        headers: <String, String>{
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = jsonDecode(response.body);
        final List<dynamic> gamesJson = responseData['games'];
        setState(() {
          _userGames = gamesJson.map((json) => UserGame.fromJson(json)).toList();
          _updateDataMap();
        });
      } else {
        setState(() {
          _error = 'Failed to load user games: ${response.statusCode}';
        });
      }
    } catch (e) {
      setState(() {
        _error = 'Error fetching user games: $e';
      });
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  void _updateDataMap() {
    dataMap = {
      "Completed": 0,
      "In Progress": 0,
      "Paused": 0,
      "Dropped": 0,
      "To Be Played": 0
    };
    for (var game in _userGames) {
      dataMap.update(game.status, (value) => value + 1, ifAbsent: () => 1);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        child: Padding( // <-- instead of Center (fixes infinite height)
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              AppBar(
                automaticallyImplyLeading: false,
                backgroundColor: Colors.transparent,
              ),
              Stack(
                children: [
                  Text(
                    "Your Games List",
                    style: TextStyle(
                      color: Colors.deepPurpleAccent,
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    "Your Games List",
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
                    "Your Games List",
                    style: TextStyle(
                      color: Colors.deepPurpleAccent,
                      shadows: [
                        Shadow(
                          blurRadius: 12,
                          color: Colors.white,
                          offset: Offset(0, 0),
                        ),
                      ],
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              if (_loading)
                const CircularProgressIndicator()
              else if (_error != null)
                Text(_error!)
              else if (_userGames.isEmpty)
                const Text('No games in your list yet.')
              else
                Column(
                  children: [
                    // ----- PIE CHART -----
                    Center(
                      child: SizedBox(
                        height: 300,
                        child: PieChart(
                          PieChartData(
                            pieTouchData: PieTouchData(
                              touchCallback: (event, response) {
                                setState(() {
                                  if (response == null || response.touchedSection == null) {
                                    touchedIndex = null;  // ← This deselects when tapping empty space
                                    return;
                                  }
                                  // If tapping the same section again, deselect it
                                  final tappedIndex = response.touchedSection!.touchedSectionIndex;
                                  if (touchedIndex == tappedIndex) {
                                    touchedIndex = null;  // ← Toggle off
                                  } else {
                                    touchedIndex = tappedIndex;  // ← Select new section
                                  }
                                });
                              },
                            ),
                            sectionsSpace: 3,
                            centerSpaceRadius: 40,
                            sections: _buildSections(),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    // ----- LEGEND -----
                    touchedIndex != null
                        ? _buildDetailView(touchedIndex!)
                        : Column(
                            children: dataMap.entries.map((entry) {
                              return Padding(
                                padding: const EdgeInsets.symmetric(vertical: 4.0),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Container(
                                      width: 16,
                                      height: 16,
                                      color: _colorFor(entry.key),
                                    ),
                                    const SizedBox(width: 8),
                                    Text("${entry.key}: ${entry.value.toInt()}"),
                                  ],
                                ),
                              );
                            }).toList(),
                          ),
                  ],
                ),
            ],
          ),
        ),
      ),
    );
  }

  // Build the pie slices
  List<PieChartSectionData> _buildSections() {
    final colors = [
      Colors.deepPurple,
      Colors.blue,
      Colors.green,
      Colors.orange,
      Colors.red,
    ];

    int index = 0;
    final nonZeroEntries = dataMap.entries.where((e) => e.value > 0).toList();

    return nonZeroEntries.map((entry) {
      final color = colors[index % colors.length];
      final isTouched = index == touchedIndex;

      final double baseRadius = 70;
      final double touchedRadius = 90;
      final double baseOpacity = 1.0;
      //final double dimOpacity = 0.3;

      final radius = isTouched ? touchedRadius : baseRadius;
      final opacity = baseOpacity;
      index++;

      return PieChartSectionData(
        value: entry.value,
        color: color.withOpacity(opacity),
        radius: radius,
        title: "",
        titleStyle: TextStyle(
          fontSize: isTouched ? 18 : 14,
          color: Colors.white,
          fontWeight: FontWeight.bold,
        ),
      );
    }).toList();
  }

  // Simple deterministic color lookup
  Color _colorFor(String key) {
    final colorMap = {
      "Completed": Colors.deepPurple,
      "In Progress": Colors.blue,
      "Paused": Colors.green,
      "Dropped": Colors.orange,
      "To Be Played": Colors.red,
    };
    return colorMap[key] ?? Colors.grey;
  }

  Widget _buildDetailView(int index) {
    // Filter non-zero entries safely
    final nonZeroEntries = dataMap.entries.where((e) => e.value > 0).toList();
    // Clamp index to prevent out-of-range
    if (index < 0 || index >= nonZeroEntries.length) return const SizedBox.shrink();

    final entry = nonZeroEntries[index];
    final status = entry.key;
    final gamesForStatus = _userGames.where((game) => game.status == status).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          status,
          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        ...gamesForStatus.map((game) {
          return Container(
            margin: const EdgeInsets.symmetric(vertical: 4),
            padding: const EdgeInsets.all(12),
            width: double.infinity,
            decoration: BoxDecoration(
              color: Colors.grey[200],
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(game.name),
          );
        }).toList(),
      ],
    );
  }
}