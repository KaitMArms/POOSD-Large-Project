import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class AddGames extends StatefulWidget {
  const AddGames({super.key});

  @override
  State<AddGames> createState() => AddGamesState();
}

class AddGamesState extends State<AddGames> {
  final _formKey = GlobalKey<FormState>();
  String _gameId = '';
  String _status = 'To Be Played';
  double _rating = 5.0;
  String _message = '';

  Future<void> _addGame() async {
    if (_formKey.currentState!.validate()) {
      _formKey.currentState!.save();

      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) {
        setState(() {
          _message = 'You are not logged in.';
        });
        return;
      }

      final response = await http.post(
        Uri.parse('https://playedit.games/api/user/games/add'),
        headers: <String, String>{
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(<String, dynamic>{
          'gameId': int.parse(_gameId), // Ensure gameId is an integer
          'status': _status,
          'rating': _rating,
        }),
      );

      if (response.statusCode == 201) {
        setState(() {
          _message = 'Game added successfully!';
        });
      } else {
        setState(() {
          _message = 'Failed to add game. ${response.body}';
        });
      }
    }
  }

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
                    "Add New Game",
                    style: TextStyle(
                      color: Colors.deepPurpleAccent,
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                
                  Text(
                    "Add New Game",
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
                    "Add New Game",
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
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Form(
                  key: _formKey,
                  child: Column(
                    children: [
                      TextFormField(
                        decoration: const InputDecoration(labelText: 'Game ID'),
                        keyboardType: TextInputType.number,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter a Game ID';
                          }
                          if (int.tryParse(value) == null) {
                            return 'Please enter a valid number';
                          }
                          return null;
                        },
                        onSaved: (value) {
                          _gameId = value!;
                        },
                      ),

                      SizedBox(height: MediaQuery.heightOf(context) * 0.02),

                      DropdownButtonFormField<String>(
                        initialValue: _status,
                        decoration: const InputDecoration(labelText: 'Status'),
                        items: <String>[
                          'Completed',
                          'In Progress',
                          'Paused',
                          'Dropped',
                          'To Be Played'
                        ].map<DropdownMenuItem<String>>((String value) {
                          return DropdownMenuItem<String>(
                            value: value,
                            child: Text(value),
                          );
                        }).toList(),
                        onChanged: (String? newValue) {
                          setState(() {
                            _status = newValue!;
                          });
                        },
                      ),
                      Slider(
                        value: _rating,
                        min: 0,
                        max: 10,
                        divisions: 20,
                        label: _rating.toStringAsFixed(1),
                        onChanged: (double value) {
                          setState(() {
                            _rating = value;
                          });
                        },
                      ),
                      ElevatedButton(
                        onPressed: _addGame,
                        child: const Text('Add Game'),
                      ),
                      if (_message.isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.only(top: 16.0),
                          child: Text(_message),
                        ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      )
    );
  }
}