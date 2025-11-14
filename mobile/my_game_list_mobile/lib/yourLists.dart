import 'package:pie_chart/pie_chart.dart';
import 'package:flutter/material.dart';

class YourGamesList extends StatefulWidget {
  const YourGamesList({super.key});

  @override
  State<YourGamesList> createState() => YourGamesListState();

}

class YourGamesListState extends State<YourGamesList>  {

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
                      decorationColor: Colors.purple,
                      decorationThickness: 2,
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                
                  Text(
                    "Your Games List",
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

              SizedBox(height: 30),

              PieChart(
                dataMap: dataMap,
                animationDuration: Duration(milliseconds: 800),
                chartRadius: MediaQuery.of(context).size.width / 2.5,
                //centerText: "Your Games",
                legendOptions: LegendOptions(
                  legendPosition: LegendPosition.right,
                  legendTextStyle: TextStyle(
                    fontSize: 14,
                  )
                ),

                chartValuesOptions: ChartValuesOptions(
                  showChartValues: true,
                  decimalPlaces: 0,
                ),
              )
            ],
          ),
        ),
      )
    );
  }
}