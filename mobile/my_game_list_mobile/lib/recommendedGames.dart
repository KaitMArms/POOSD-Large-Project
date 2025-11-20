/*import 'package:flutter/material.dart';
import 'package:my_game_list_mobile/browse.dart';

class recommendedGames extends StatefulWidget {
  const recommendedGames({super.key});

  @override
  State<recommendedGames> createState() => recommendedGamesState();

}

class recommendedGamesState extends State<recommendedGames>  {
  @override
  Widget build(BuildContext context) {
    // TODO: implement build
    throw UnimplementedError();
  }
}*/

import 'package:flutter/material.dart';
import 'package:my_game_list_mobile/browse.dart';

class RecommendedGames extends StatelessWidget {
  final List<Game> games;
  final bool loading;
  final String? error;

  const RecommendedGames({
    super.key,
    required this.games,
    required this.loading,
    required this.error,
  });

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Text(
            error!,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
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
      itemCount: games.length,
      itemBuilder: (context, index) {
        final game = games[index];
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
    );
  }
}
