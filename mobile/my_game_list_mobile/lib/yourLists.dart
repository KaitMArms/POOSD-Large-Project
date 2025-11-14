import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

class YourGamesList extends StatefulWidget {
  const YourGamesList({super.key});

  @override
  State<YourGamesList> createState() => YourGamesListState();
}

class YourGamesListState extends State<YourGamesList>  {

  int? touchedIndex;

  Map<String, double> dataMap = {
    "Completed": 5,
    "In Progress": 3,
    "Paused": 2,
    "Dropped": 2,
    "To Be Played": 5
  };

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
                  backgroundColor: Colors.transparent,
                  automaticallyImplyLeading: true,
                ),
                const SizedBox(height: 5),
            
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
                          )
                        ],
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
            
                const SizedBox(height: 10),
            
                // ----- PIE CHART -----
                Center(
                  
                  child: SizedBox(
                    height: 200,
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
                            }
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
                    )
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

    final nonZeroEntries = dataMap.entries.where((e) => e.value > 0);

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
        color: color.withValues(alpha: opacity),
        radius: radius,
        title: "",
        titleStyle: TextStyle(
          fontSize: isTouched ? 18 : 14,
          color: Colors.white,
          fontWeight: FontWeight.bold,
        )
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
  if (index < 0 || index >= nonZeroEntries.length) return SizedBox.shrink();

  final entry = nonZeroEntries[index];

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(
        entry.key,
        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
      ),
      const SizedBox(height: 8),
      ...List.generate(entry.value.toInt(), (i) {
        return Container(
          margin: const EdgeInsets.symmetric(vertical: 4),
          padding: const EdgeInsets.all(12),
          width: double.infinity,
          decoration: BoxDecoration(
            color: Colors.grey[200],
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text("Game ${i + 1} in ${entry.key}"),
          );
        }),
      ],
    );
  }
}