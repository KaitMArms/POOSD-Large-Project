import 'package:flutter/material.dart';
import 'package:material_design_icons_flutter/material_design_icons_flutter.dart';
class Profile extends StatefulWidget {
  const Profile({super.key});

  @override
  State<Profile> createState() => _ProfileState();

}
class _ProfileState extends State<Profile> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.transparent,
        title: const Text("Profile"),
        centerTitle: true,
        actions: [
          IconButton(
            onPressed: () {}, 
            icon: Icon(MdiIcons.accountSettings) 
          )
        ],
      ),
      //default Scaffold retains base colors of light mode = light blue, dark mode = dark blue
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: 3,
        type: BottomNavigationBarType.fixed,
        items: [
          BottomNavigationBarItem(
            icon: Icon(MdiIcons.accountOutline),
            activeIcon: Icon(MdiIcons.account),
            label: "Explore"
          ),

          BottomNavigationBarItem(
            icon: Icon(MdiIcons.chartPieOutline),
            activeIcon: Icon(MdiIcons.chartPie),
            label: "Your Info",
          ),

          BottomNavigationBarItem(
            icon: Icon(MdiIcons.lockOutline),
            activeIcon: Icon(MdiIcons.lock),
            label: "For Later"
          ),

          BottomNavigationBarItem(
            icon: Icon(MdiIcons.accountOutline),
            activeIcon: Icon(MdiIcons.account),
            label: "Profile"
          ),
        ]
      ),
    );
  }
}