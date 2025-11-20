/*import 'package:flutter/material.dart';
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

  return Column(
    children: [
      const SizedBox(height: 12),
      // NEW: Section Header
      Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16.0),
        child: Text(
          'Recommended Games',
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: Theme.of(context).colorScheme.primary,
          ),
        ),
      ),
      const SizedBox(height: 12),
      // Existing GridView
      Expanded(
        child: GridView.builder(
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
                        fit: BoxFit.contain,
                        width: double.infinity,
                      ),
                    ),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16.0, 8.0, 16.0, 16.0),
                    child: SizedBox(
                      height: 40,
                      child: Center(
                        child: Text(
                          game.name,
                          textAlign: TextAlign.center,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 16.0,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
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
  );
}
}
*/


import 'package:flutter/material.dart';
import 'package:my_game_list_mobile/browse.dart';
import 'package:my_game_list_mobile/gameDetails.dart';

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

    return Column(
      children: [
        const SizedBox(height: 12),
        // NEW: Section Header
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: Text(
            'Recommended Games',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Theme.of(context).colorScheme.primary,
            ),
          ),
        ),
        const SizedBox(height: 12),
        // Existing GridView
        Expanded(
          child: GridView.builder(
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
              return InkWell(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => GameDetails(
                        gameSlug: game.slug ?? '', // Use slug instead
                        gameName: game.name,
                      ),
                    ),
                  );
                },
                child: Card(
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
                        padding: const EdgeInsets.fromLTRB(16.0, 8.0, 16.0, 16.0),
                        child: SizedBox(
                          height: 40,
                          child: Center(
                            child: Text(
                              game.name,
                              textAlign: TextAlign.center,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontSize: 16.0,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}