import 'package:flutter/material.dart';
import 'package:material_design_icons_flutter/material_design_icons_flutter.dart';
import 'package:my_game_list_mobile/browse.dart';
import 'package:my_game_list_mobile/yourLists.dart';
import 'profile.dart'; // your current Profile page

class MainNavigation extends StatefulWidget {
  const MainNavigation({super.key});

  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  int currentIndex = 2;

  final screens = [
    AllGames(),
    YourGamesList(),
    //Center(child: Text("For Later", style: TextStyle(fontSize: 30))),
    Profile(), // <- your full Profile screen here
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: screens[currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: currentIndex,
        onTap: (index) => setState(() => currentIndex = index),
        type: BottomNavigationBarType.fixed,
        items: [
          BottomNavigationBarItem(
            icon: Icon(MdiIcons.viewListOutline),
            activeIcon: Icon(MdiIcons.viewList),
            label: "Explore",
          ),
          BottomNavigationBarItem(
            icon: Icon(MdiIcons.chartPieOutline),
            activeIcon: Icon(MdiIcons.chartPie),
            label: "Games",
          ),
          /*BottomNavigationBarItem(
            icon: Icon(MdiIcons.lockOutline),
            activeIcon: Icon(MdiIcons.lock),
            label: "For Later"
          ),*/
          BottomNavigationBarItem(
            icon: Icon(MdiIcons.accountOutline),
            activeIcon: Icon(MdiIcons.account),
            label: "Profile"
          ),
        ],
      ),
    );
  }
}
